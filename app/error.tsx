"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Algo no cargó bien</h2>
        <p style={{ opacity: 0.7, marginBottom: 16, fontSize: 14 }}>
          Esta sección tuvo un problema al renderizar. Puedes reintentar.
        </p>
        <button onClick={() => reset()} style={{ padding: "8px 20px", borderRadius: 8, border: "none",
          background: "#4f46e5", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          Reintentar
        </button>
      </div>
    </div>
  );
}
