"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh",
        alignItems: "center", justifyContent: "center", margin: 0 }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Algo salió mal</h2>
          <p style={{ opacity: 0.7, margin: "8px 0 16px" }}>Reintenta la operación.</p>
          <button onClick={() => reset()} style={{ padding: "8px 20px", borderRadius: 8, border: "none",
            background: "#4f46e5", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Reintentar</button>
        </div>
      </body>
    </html>
  );
}
