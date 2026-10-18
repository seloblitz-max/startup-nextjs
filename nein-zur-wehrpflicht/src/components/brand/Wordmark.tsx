/** Schriftzug wie auf dem Sticker: „GEN Z“ in ExtraBold, „STEHT AUF“ normal. */
export default function Wordmark({ className = "text-[1.0625rem]" }: { className?: string }) {
  return (
    <span className={`uppercase leading-none ${className}`}>
      <span className="font-extrabold">Gen Z</span> steht auf
    </span>
  );
}
