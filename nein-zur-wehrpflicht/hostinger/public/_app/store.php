<?php
declare(strict_types=1);

/*
 * Speicher für die Abstimmung: SQLite (Standard, ohne Einrichtung) oder MySQL/MariaDB (siehe config.php).
 * Verhält sich wie die Redis-Fassung in src/lib/store.ts: eine Stimme pro Gerät, ein Wechsel verschiebt die Stimme,
 * Grenzwerte pro Netz, Geräte-Einträge löschen sich am Löschtermin, die Zähler pro Stadt bleiben stehen.
 * Dazu kommen die Aufrufe pro Stadt (Reihenfolge der Liste) und die Grenze für das Kontaktformular.
 * Alle Schreibvorgänge laufen nacheinander unter einer Sperre, so bleiben die Nummern pro Stadt eindeutig.
 */

final class GzsaSetupError extends RuntimeException
{
}

final class GzsaStore
{
    /** Höchstens so oft (Sekunden) räumt die Seite abgelaufene Einträge weg. */
    private const CLEANUP_EVERY = 30;

    private PDO $pdo;
    /** 'sqlite' oder 'mysql' */
    private string $driver;
    /** Wo die SQLite-Datei liegt: 'home', 'app' oder 'custom'. */
    private ?string $where;
    private ?string $secret = null;
    private array $meta = ['version' => 0, 'cleanup' => 0, 'purged' => 0];

    private function __construct(PDO $pdo, string $driver, ?string $where)
    {
        $this->pdo = $pdo;
        $this->driver = $driver;
        $this->where = $where;
    }

    public static function mysqlConfigured(): bool
    {
        return trim((string) gzsa_config()['mysql']['database']) !== '';
    }

    public static function open(): self
    {
        static $store = null;
        if ($store !== null) {
            return $store;
        }
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5,
        ];

        if (self::mysqlConfigured()) {
            if (!extension_loaded('pdo_mysql')) {
                throw new GzsaSetupError('Für MySQL fehlt die PHP-Erweiterung pdo_mysql (hPanel → Erweitert → PHP-Konfiguration).');
            }
            $db = gzsa_config()['mysql'];
            $dsn = 'mysql:host=' . $db['host'] . ';dbname=' . $db['database'] . ';charset=utf8mb4'
                . (trim((string) $db['port']) !== '' ? ';port=' . (int) $db['port'] : '');
            $pdo = new PDO($dsn, (string) $db['user'], (string) $db['password'], $options + [PDO::ATTR_EMULATE_PREPARES => false]);
            return $store = new self($pdo, 'mysql', null);
        }

        if (!extension_loaded('pdo_sqlite')) {
            throw new GzsaSetupError(
                'Für die Datenbank fehlt die PHP-Erweiterung pdo_sqlite. Bitte im hPanel unter Erweitert → PHP-Konfiguration '
                . '→ PHP-Erweiterungen „pdo_sqlite“ einschalten oder in _app/config.php eine MySQL-Datenbank eintragen.'
            );
        }
        [$dir, $where] = self::dataDir();
        if ($dir === null) {
            throw new GzsaSetupError(
                'Kein beschreibbarer Ordner für die Datenbank. Bitte in _app/config.php bei data_dir einen Ordner eintragen '
                . 'oder eine MySQL-Datenbank.'
            );
        }
        $file = $dir . '/abstimmung.sqlite';
        $new = !is_file($file);
        $pdo = new PDO('sqlite:' . $file, null, null, $options);
        if ($new) {
            @chmod($file, 0600);
        }
        $pdo->exec('PRAGMA busy_timeout = 5000');
        try {
            // WAL: Lesen wartet nicht auf Schreiben. Die Einstellung bleibt in der Datei gespeichert.
            if (strtolower((string) $pdo->query('PRAGMA journal_mode')->fetchColumn()) !== 'wal') {
                $pdo->query('PRAGMA journal_mode = WAL')->fetchAll();
            }
        } catch (PDOException $e) {
            // Geht auch ohne, nur etwas langsamer.
        }
        $pdo->exec('PRAGMA synchronous = NORMAL');
        // Gelöschte Einträge werden in der Datei überschrieben, nicht nur als frei markiert.
        $pdo->exec('PRAGMA secure_delete = ON');
        return $store = new self($pdo, 'sqlite', $where);
    }

    /** Ordner für die SQLite-Datei: möglichst außerhalb von public_html, damit sie nie ausgeliefert werden kann. */
    private static function dataDir(): array
    {
        $custom = trim((string) gzsa_config()['data_dir']);
        $candidates = [];
        if ($custom !== '') {
            $candidates[] = [rtrim($custom, '/'), 'custom'];
        } else {
            $home = self::homeDir();
            if ($home !== null) {
                $candidates[] = [$home . '/gzsa-daten/' . self::siteKey($home), 'home'];
            }
            $candidates[] = [__DIR__ . '/daten', 'app'];
        }
        foreach ($candidates as [$dir, $where]) {
            if (!@is_dir($dir)) {
                @mkdir($dir, 0700, true);
            }
            if (@is_dir($dir) && @is_writable($dir)) {
                self::protect($dir);
                return [$dir, $where];
            }
        }
        return [null, null];
    }

    /** Home-Verzeichnis des Webspace, bei Hostinger etwa /home/u123456789 (darin liegen „domains“ und „public_html“). */
    private static function homeDir(): ?string
    {
        $root = realpath(GZSA_ROOT) ?: GZSA_ROOT;
        return preg_match('#^(/home\d*/[^/]+)/#', $root, $m) ? $m[1] : null;
    }

    /** Eigener Unterordner pro Website, falls das Paket auf mehreren Domains liegt. */
    private static function siteKey(string $home): string
    {
        $root = realpath(GZSA_ROOT) ?: GZSA_ROOT;
        $key = preg_replace('/[^A-Za-z0-9.-]+/', '_', trim(substr($root, strlen($home)), '/'));
        return $key !== '' ? $key : 'website';
    }

    /** Falls der Ordner doch im Web liegt: sperren. Und kurz erklären, was er ist. */
    private static function protect(string $dir): void
    {
        $files = [
            '.htaccess' => "Require all denied\n",
            'index.html' => '',
            'LIESMICH.txt' => "Hier speichert die Website „Gen Z steht auf“ die Zusagen (SQLite).\n"
                . "Die Einträge der Geräte löschen sich am 14. November 2026 von selbst.\n"
                . "Danach kann dieser Ordner gelöscht werden.\n",
        ];
        foreach ($files as $name => $content) {
            if (!is_file($dir . '/' . $name)) {
                @file_put_contents($dir . '/' . $name, $content);
            }
        }
    }

    public function label(): string
    {
        return $this->driver === 'sqlite' ? 'SQLite' : 'MySQL';
    }

    public function insideWebroot(): bool
    {
        return $this->where === 'app';
    }

    /** Schlüssel für Geräte-Kennungen und Netz-Hashes. Entsteht beim ersten Aufruf und bleibt in der Datenbank. */
    public function secret(): string
    {
        if ($this->secret === null) {
            $read = function () {
                return $this->value("SELECT t FROM gzsa_meta WHERE k = 'secret'");
            };
            $secret = $this->guard($read);
            if (!is_string($secret) || strlen($secret) < 32) {
                $this->createSchema();
                $secret = $read();
            }
            if (!is_string($secret) || strlen($secret) < 32) {
                throw new RuntimeException('Schlüssel fehlt in gzsa_meta');
            }
            $this->secret = $secret;
        }
        return $this->secret;
    }

    /** Öffentlicher Zählerstand. */
    public function snapshot(): array
    {
        $snap = $this->guard(function () {
            return $this->snap();
        });
        $this->maybeCleanup();
        return $snap;
    }

    public function mine(string $id): ?array
    {
        $row = $this->guard(function () use ($id) {
            return $this->one('SELECT city, rank_nr FROM gzsa_devices WHERE id = ? AND expires_at > ?', [$id, time()]);
        });
        return $row !== null && gzsa_is_city($row['city']) ? ['city' => $row['city'], 'rank' => (int) $row['rank_nr']] : null;
    }

    /**
     * Zusage oder Wechsel. Wie VOTE_LUA in src/lib/store.ts:
     * Minutengrenze (zählt auch abgelehnte Versuche), dieselbe Stadt ändert nichts, neue Geräte zählen gegen die
     * Tagesgrenze, ein Wechsel nimmt die Stimme aus der alten Stadt mit.
     */
    public function vote(string $id, string $net, string $city): array
    {
        $result = $this->guard(function () use ($id, $net, $city) {
            return $this->write(function () use ($id, $net, $city) {
                $now = time();
                if ($this->hit('rl:' . $net . ':' . intdiv($now, 60), 120, $now) > $this->limit('max_votes_per_minute')) {
                    return ['ok' => false, 'reason' => 'rate', 'snapshot' => $this->snap()];
                }
                $row = $this->one('SELECT city, rank_nr FROM gzsa_devices WHERE id = ? AND expires_at > ?', [$id, $now]);
                $old = $row !== null ? (string) $row['city'] : null;
                if ($old === $city) {
                    return ['ok' => true, 'mine' => ['city' => $city, 'rank' => (int) $row['rank_nr']], 'previous' => null, 'snapshot' => $this->snap()];
                }
                if ($old === null) {
                    if ($this->hit('ip:' . $net . ':' . gmdate('Y-m-d', $now), 90000, $now) > $this->limit('max_new_devices_per_day')) {
                        return ['ok' => false, 'reason' => 'limit', 'snapshot' => $this->snap()];
                    }
                } else {
                    $this->run('UPDATE gzsa_counts SET n = n - 1 WHERE city = ? AND n > 0', [$old]);
                }
                if ($this->run('UPDATE gzsa_counts SET n = n + 1 WHERE city = ?', [$city])->rowCount() === 0) {
                    $this->run('INSERT INTO gzsa_counts (city, n) VALUES (?, 1)', [$city]);
                }
                $rank = (int) $this->value('SELECT n FROM gzsa_counts WHERE city = ?', [$city]);
                $this->run(
                    'REPLACE INTO gzsa_devices (id, city, rank_nr, expires_at) VALUES (?, ?, ?, ?)',
                    [$id, $city, $rank, $this->deviceExpiresAt($now)]
                );
                $this->run("UPDATE gzsa_meta SET n = n + 1 WHERE k = 'version'");
                return ['ok' => true, 'mine' => ['city' => $city, 'rank' => $rank], 'previous' => $old, 'snapshot' => $this->snap()];
            });
        });
        $this->maybeCleanup();
        return $result;
    }

    /**
     * Klickzähler: Jemand hat eine Stadt geöffnet. Pro Netz zählt jede Stadt höchstens einmal pro Stunde, wie VIEW_LUA
     * in src/lib/store.ts. Gibt zurück, ob gezählt wurde.
     */
    public function view(string $net, string $city): bool
    {
        $counted = $this->guard(function () use ($net, $city) {
            return $this->write(function () use ($net, $city) {
                $now = time();
                // Kurzer Schlüssel (höchstens 64 Zeichen): Netz, Stunde und ein Kürzel der Stadt.
                $key = 'vs:' . $net . ':' . intdiv($now, 3600) . ':' . substr(hash('sha256', $city), 0, 12);
                if ($this->hit($key, 3600, $now) > 1) {
                    return false;
                }
                if ($this->run('UPDATE gzsa_views SET n = n + 1 WHERE city = ?', [$city])->rowCount() === 0) {
                    $this->run('INSERT INTO gzsa_views (city, n) VALUES (?, 1)', [$city]);
                }
                return true;
            });
        });
        $this->maybeCleanup();
        return $counted;
    }

    /** Nachrichten aus diesem Netz in der laufenden Stunde, diese mitgezählt (Grenze für das Kontaktformular). */
    public function contactHit(string $net): int
    {
        $hits = $this->guard(function () use ($net) {
            return $this->write(function () use ($net) {
                return $this->hit('ct:' . $net, 3600, time());
            });
        });
        $this->maybeCleanup();
        return $hits;
    }

    /** Zusage zurückziehen: Geräte-Eintrag löschen, die Stadt um eins verringern (nie unter null). */
    public function withdraw(string $id, string $net): array
    {
        $result = $this->guard(function () use ($id, $net) {
            return $this->write(function () use ($id, $net) {
                $now = time();
                if ($this->hit('rl:' . $net . ':' . intdiv($now, 60), 120, $now) > $this->limit('max_votes_per_minute')) {
                    return ['ok' => false, 'reason' => 'rate', 'snapshot' => $this->snap()];
                }
                $row = $this->one('SELECT city FROM gzsa_devices WHERE id = ? AND expires_at > ?', [$id, $now]);
                if ($row === null) {
                    return ['ok' => true, 'removed' => null, 'snapshot' => $this->snap()];
                }
                $old = (string) $row['city'];
                $this->run('DELETE FROM gzsa_devices WHERE id = ?', [$id]);
                $this->run('UPDATE gzsa_counts SET n = n - 1 WHERE city = ? AND n > 0', [$old]);
                $this->run("UPDATE gzsa_meta SET n = n + 1 WHERE k = 'version'");
                return ['ok' => true, 'removed' => gzsa_is_city($old) ? $old : null, 'snapshot' => $this->snap()];
            });
        });
        $this->maybeCleanup();
        return $result;
    }

    private function limit(string $key): int
    {
        $n = (int) gzsa_config()[$key];
        return $n > 0 ? $n : ($key === 'max_votes_per_minute' ? 40 : 150);
    }

    /** Geräte-Einträge löschen sich am Löschtermin (14. November 2026), spätere nach einem Tag. */
    private function deviceExpiresAt(int $now): int
    {
        $target = gzsa_delete_at();
        return $target > $now ? $target : $now + 86400;
    }

    /** Zähler für einen Grenzwert um eins erhöhen. Die Ablaufzeit gilt ab dem ersten Treffer, wie EXPIRE in Redis. */
    private function hit(string $key, int $ttl, int $now): int
    {
        $row = $this->one('SELECT hits FROM gzsa_limits WHERE k = ? AND expires_at > ?', [$key, $now]);
        if ($row !== null) {
            $this->run('UPDATE gzsa_limits SET hits = hits + 1 WHERE k = ?', [$key]);
            return (int) $row['hits'] + 1;
        }
        $this->run('REPLACE INTO gzsa_limits (k, hits, expires_at) VALUES (?, 1, ?)', [$key, $now + $ttl]);
        return 1;
    }

    /** Zählerstand, Aufrufe und Version in einer Abfrage, damit alles zusammenpasst. */
    private function snap(): array
    {
        $rows = $this->run(
            "SELECT 'c' AS t, city AS k, n FROM gzsa_counts WHERE n > 0"
            . " UNION ALL SELECT 'w' AS t, city AS k, n FROM gzsa_views WHERE n > 0"
            . " UNION ALL SELECT 'm' AS t, k, n FROM gzsa_meta WHERE k IN ('version', 'cleanup', 'purged')"
        )->fetchAll();
        $counts = [];
        $views = [];
        $total = 0;
        $meta = ['version' => 0, 'cleanup' => 0, 'purged' => 0];
        foreach ($rows as $row) {
            $n = (int) $row['n'];
            if ($row['t'] === 'm') {
                $meta[$row['k']] = $n;
            } elseif (!gzsa_is_city($row['k']) || $n <= 0) {
                continue;
            } elseif ($row['t'] === 'w') {
                $views[$row['k']] = $n;
            } else {
                $counts[$row['k']] = $n;
                $total += $n;
            }
        }
        $this->meta = $meta;
        return ['counts' => (object) $counts, 'total' => $total, 'v' => $meta['version'], 'views' => (object) $views];
    }

    /**
     * Abgelaufene Einträge löschen. Redis erledigt das von selbst, hier passiert es bei der nächsten Anfrage,
     * höchstens alle 30 Sekunden. Nach dem Löschtermin wird die Datei einmal neu geschrieben.
     */
    private function maybeCleanup(): void
    {
        $now = time();
        $purge = $now >= gzsa_delete_at() && $this->meta['purged'] === 0;
        if (!$purge && $now - $this->meta['cleanup'] < self::CLEANUP_EVERY) {
            return;
        }
        try {
            $this->write(function () use ($now, $purge) {
                $this->run('DELETE FROM gzsa_devices WHERE expires_at <= ?', [$now]);
                $this->run('DELETE FROM gzsa_limits WHERE expires_at <= ?', [$now]);
                $this->run("UPDATE gzsa_meta SET n = ? WHERE k = 'cleanup'", [$now]);
                if ($purge) {
                    $this->run("UPDATE gzsa_meta SET n = 1 WHERE k = 'purged'");
                }
            });
            $this->meta['cleanup'] = $now;
            if ($purge) {
                $this->meta['purged'] = 1;
                if ($this->driver === 'sqlite') {
                    $this->pdo->exec('VACUUM');
                    $this->pdo->query('PRAGMA wal_checkpoint(TRUNCATE)')->fetchAll();
                } else {
                    $this->pdo->query('OPTIMIZE TABLE gzsa_devices, gzsa_limits')->fetchAll();
                }
            }
        } catch (Throwable $e) {
            error_log('gzsa cleanup: ' . $e->getMessage());
        }
    }

    /** Transaktion mit Schreibsperre: Alle Schreibvorgänge laufen nacheinander. */
    private function write(callable $fn)
    {
        if ($this->driver === 'sqlite') {
            $this->pdo->exec('BEGIN IMMEDIATE');
        } else {
            $this->pdo->beginTransaction();
        }
        try {
            if ($this->driver === 'mysql') {
                $this->value("SELECT n FROM gzsa_meta WHERE k = 'version' FOR UPDATE");
            }
            $result = $fn();
            if ($this->driver === 'sqlite') {
                $this->pdo->exec('COMMIT');
            } else {
                $this->pdo->commit();
            }
            return $result;
        } catch (Throwable $e) {
            $this->rollback();
            throw $e;
        }
    }

    private function rollback(): void
    {
        try {
            if ($this->driver === 'sqlite') {
                $this->pdo->exec('ROLLBACK');
            } elseif ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
        } catch (Throwable $e) {
            // Keine offene Transaktion.
        }
    }

    /** Fehlen die Tabellen noch (erster Aufruf), werden sie angelegt und der Vorgang wiederholt. */
    private function guard(callable $fn)
    {
        try {
            return $fn();
        } catch (PDOException $e) {
            if (!$this->missingTable($e)) {
                throw $e;
            }
            $this->rollback();
            $this->createSchema();
            return $fn();
        }
    }

    private function missingTable(PDOException $e): bool
    {
        if ($this->driver === 'mysql') {
            return $e->getCode() === '42S02' || (int) ($e->errorInfo[1] ?? 0) === 1146;
        }
        return stripos($e->getMessage(), 'no such table') !== false;
    }

    private function createSchema(): void
    {
        if ($this->driver === 'sqlite') {
            $this->write(function () {
                $this->pdo->exec("CREATE TABLE IF NOT EXISTS gzsa_meta (k TEXT PRIMARY KEY, n INTEGER NOT NULL DEFAULT 0, t TEXT NOT NULL DEFAULT '')");
                $this->pdo->exec('CREATE TABLE IF NOT EXISTS gzsa_counts (city TEXT PRIMARY KEY, n INTEGER NOT NULL DEFAULT 0)');
                $this->pdo->exec('CREATE TABLE IF NOT EXISTS gzsa_views (city TEXT PRIMARY KEY, n INTEGER NOT NULL DEFAULT 0)');
                $this->pdo->exec('CREATE TABLE IF NOT EXISTS gzsa_devices (id TEXT PRIMARY KEY, city TEXT NOT NULL, rank_nr INTEGER NOT NULL, expires_at INTEGER NOT NULL)');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS gzsa_devices_expires ON gzsa_devices (expires_at)');
                $this->pdo->exec('CREATE TABLE IF NOT EXISTS gzsa_limits (k TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL)');
                $this->pdo->exec('CREATE INDEX IF NOT EXISTS gzsa_limits_expires ON gzsa_limits (expires_at)');
                $this->seed('INSERT OR IGNORE');
            });
            return;
        }
        $table = ' ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin';
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS gzsa_meta (k VARCHAR(32) NOT NULL PRIMARY KEY, n BIGINT NOT NULL DEFAULT 0, t VARCHAR(255) NOT NULL DEFAULT '')" . $table);
        $this->pdo->exec('CREATE TABLE IF NOT EXISTS gzsa_counts (city VARCHAR(32) NOT NULL PRIMARY KEY, n INT NOT NULL DEFAULT 0)' . $table);
        $this->pdo->exec('CREATE TABLE IF NOT EXISTS gzsa_views (city VARCHAR(32) NOT NULL PRIMARY KEY, n INT NOT NULL DEFAULT 0)' . $table);
        $this->pdo->exec('CREATE TABLE IF NOT EXISTS gzsa_devices (id CHAR(36) NOT NULL PRIMARY KEY, city VARCHAR(32) NOT NULL, rank_nr INT NOT NULL, expires_at BIGINT NOT NULL, KEY gzsa_devices_expires (expires_at))' . $table);
        $this->pdo->exec('CREATE TABLE IF NOT EXISTS gzsa_limits (k VARCHAR(64) NOT NULL PRIMARY KEY, hits INT NOT NULL, expires_at BIGINT NOT NULL, KEY gzsa_limits_expires (expires_at))' . $table);
        $this->seed('INSERT IGNORE');
    }

    private function seed(string $insert): void
    {
        $this->run($insert . " INTO gzsa_meta (k, n, t) VALUES ('version', 0, ''), ('cleanup', 0, ''), ('purged', 0, '')");
        $this->run($insert . " INTO gzsa_meta (k, n, t) VALUES ('secret', 0, ?)", [gzsa_b64url(random_bytes(32))]);
        foreach (gzsa_data()['cities'] as $city) {
            $this->run($insert . ' INTO gzsa_counts (city, n) VALUES (?, 0)', [$city]);
        }
    }

    private function run(string $sql, array $params = []): PDOStatement
    {
        $stmt = $this->pdo->prepare($sql);
        foreach (array_values($params) as $i => $value) {
            $stmt->bindValue($i + 1, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $stmt->execute();
        return $stmt;
    }

    private function one(string $sql, array $params = []): ?array
    {
        $row = $this->run($sql, $params)->fetch();
        return $row === false ? null : $row;
    }

    private function value(string $sql, array $params = [])
    {
        return $this->run($sql, $params)->fetchColumn();
    }
}
