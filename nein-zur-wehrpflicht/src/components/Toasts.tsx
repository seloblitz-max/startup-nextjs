"use client";

import { Toaster } from "sonner";

export default function Toasts() {
  return (
    <Toaster
      position="top-center"
      theme="dark"
      offset={{ top: "5rem" }}
      mobileOffset={{ top: "4.75rem", left: "1rem", right: "1rem" }}
      toastOptions={{ classNames: { toast: "toast", title: "toast-title", actionButton: "toast-action" } }}
      style={
        {
          "--normal-bg": "#1c1a18",
          "--normal-border": "#3a3632",
          "--normal-text": "#f3efe6",
          "--border-radius": "10px",
        } as React.CSSProperties
      }
    />
  );
}
