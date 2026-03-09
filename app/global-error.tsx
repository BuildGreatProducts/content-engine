"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0A0A0F", color: "#F0F0F5", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Something went wrong</h2>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#6B5EFF",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
