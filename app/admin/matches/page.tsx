"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function MatchesAdminDebug() {
  const [rounds, setRounds] = useState<any[]>([])
  const [raw, setRaw] = useState<any>(null)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const test = async () => {
      console.log("🚀 TEST START")

      const res = await supabase.from("rounds").select("*")

      console.log("FULL RESPONSE:", res)

      setRaw(res)

      if (res.error) {
        console.log("❌ ERROR:", res.error)
        setError(res.error)
        return
      }

      console.log("✅ DATA:", res.data)

      setRounds(res.data || [])
    }

    test()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>🧪 DEBUG SUPABASE ROUNDS</h1>

      {/* ESTADO CONEXIÓN */}
      <h2>Estado conexión</h2>

      {error && (
        <div style={{ color: "red" }}>
          ❌ ERROR: {JSON.stringify(error)}
        </div>
      )}

      {!error && raw && (
        <div style={{ color: "green" }}>
          ✅ Conexión OK
        </div>
      )}

      {/* RAW RESPONSE */}
      <h2>RAW RESPONSE</h2>
      <pre style={{ background: "#eee", padding: 10 }}>
        {JSON.stringify(raw, null, 2)}
      </pre>

      {/* ROUNDS */}
      <h2>ROUNDS PARSED</h2>

      {rounds.length === 0 ? (
        <p>⚠️ No llegan rondas</p>
      ) : (
        rounds.map((r) => (
          <div key={r.id} style={{ marginBottom: 8 }}>
            <strong>{r.name}</strong> — {r.id}
          </div>
        ))
      )}

      {/* SELECT TEST */}
      <h2>Select test</h2>

      <select>
        <option>Selecciona ronda</option>

        {rounds.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  )
}