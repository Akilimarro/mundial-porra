"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminConnectionTest() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
  const [url, setUrl] = useState<string | null>(null)
  const [key, setKey] = useState<string | null>(null)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const runTest = async () => {
      setUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || null)
      setKey(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? "✔ Key presente"
          : null
      )

      try {
        const { error } = await supabase.from("rounds").select("id").limit(1)

        if (error) {
          setError(error)
          setStatus("error")
        } else {
          setStatus("ok")
        }
      } catch (e) {
        setError(e)
        setStatus("error")
      }
    }

    runTest()
  }, [])

  const getIcon = () => {
    if (status === "loading") return "⏳"
    if (status === "ok") return "🟢"
    return "🔴"
  }

  const getText = () => {
    if (status === "loading") return "Probando conexión..."
    if (status === "ok") return "Conexión OK con Supabase"
    return "Error de conexión"
  }

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1>🧪 Test de conexión Supabase</h1>

      <div style={{ fontSize: 22, marginTop: 20 }}>
        {getIcon()} {getText()}
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h3>🔧 Variables de entorno</h3>

      <p>
        <strong>URL:</strong>{" "}
        {url ? url : "❌ No encontrada"}
      </p>

      <p>
        <strong>ANON KEY:</strong>{" "}
        {key ? key : "❌ No encontrada"}
      </p>

      <hr style={{ margin: "20px 0" }} />

      <h3>🐞 Error (si existe)</h3>

      <pre style={{ color: "red" }}>
        {error ? JSON.stringify(error, null, 2) : "Sin errores"}
      </pre>
    </div>
  )
}