"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Round = {
  id: string
  name: string
}

type Match = {
  id: string
  team_home: string
  team_away: string
  match_date: string
  lock_date: string
  round_id: string
  goals_home: number | null
  goals_away: number | null
}

export default function MatchesAdmin() {
  const [matches, setMatches] = useState<Match[]>([])
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    team_home: "",
    team_away: "",
    match_date: "",
    round_id: ""
  })

  // 👇 estado correcto para resultados (SIN mutar objetos)
  const [results, setResults] = useState<
    Record<string, { home?: number; away?: number }>
  >({})

  // -----------------------------
  // LOAD DATA
  // -----------------------------
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [{ data: m }, { data: r }] = await Promise.all([
      supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true }),

      supabase
        .from("rounds")
        .select("*")
        .order("order_number", { ascending: true })
    ])

    setMatches(m || [])
    setRounds(r || [])
  }

  // -----------------------------
  // CREATE MATCH
  // -----------------------------

  const createMatch = async () => {
    if (!form.team_home || !form.team_away || !form.match_date || !form.round_id) {
      alert("Rellena todos los campos")
      return
    }

    setLoading(true)

    const lockDate = new Date(form.match_date)
    lockDate.setDate(lockDate.getDate() - 1)
    lockDate.setHours(23, 59, 59, 999)

    const payload = {
      team_home: form.team_home,
      team_away: form.team_away,
      match_date: form.match_date,
      lock_date: lockDate.toISOString(),
      round_id: form.round_id
    }

    console.log("📦 INSERT PAYLOAD:", payload)

    const { data, error } = await supabase
      .from("matches")
      .insert([payload])
      .select()

    setLoading(false)

    if (error) {
      console.error("❌ SUPABASE ERROR FULL:", error)
      alert(error.message) // 👈 ESTE ES EL CLAVE
      return
    }

    console.log("✅ CREATED:", data)

    setForm({
      team_home: "",
      team_away: "",
      match_date: "",
      round_id: ""
    })

    loadData()
  }

  // -----------------------------
  // UPDATE RESULT
  // -----------------------------
  const updateResult = async (
    id: string,
    home: number,
    away: number
  ) => {
    const { error } = await supabase
      .from("matches")
      .update({
        goals_home: home,
        goals_away: away
      })
      .eq("id", id)

    if (error) {
      console.error(error)
      alert("Error actualizando resultado")
      return
    }

    loadData()
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{ padding: 24 }}>
      <h1>⚽ Admin de Partidos</h1>

      {/* FORM */}
      <div style={{
        padding: 16,
        border: "1px solid #ddd",
        marginBottom: 24
      }}>
        <h3>Crear partido</h3>

        <input
          placeholder="Equipo local"
          value={form.team_home}
          onChange={(e) =>
            setForm({ ...form, team_home: e.target.value })
          }
        />

        <input
          placeholder="Equipo visitante"
          value={form.team_away}
          onChange={(e) =>
            setForm({ ...form, team_away: e.target.value })
          }
        />

        <input
          type="datetime-local"
          value={form.match_date}
          onChange={(e) =>
            setForm({ ...form, match_date: e.target.value })
          }
        />

        <select
          value={form.round_id}
          onChange={(e) =>
            setForm({ ...form, round_id: e.target.value })
          }
        >
          <option value="">Selecciona ronda</option>

          {rounds.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <button onClick={createMatch} disabled={loading}>
          {loading ? "Creando..." : "Crear partido"}
        </button>
      </div>

      {/* LIST */}
      <h3>Partidos</h3>

      {matches.length === 0 && <p>No hay partidos aún</p>}

      {matches.map((m) => (
        <div
          key={m.id}
          style={{
            padding: 10,
            borderBottom: "1px solid #eee"
          }}
        >
          <strong>
            {m.team_home} vs {m.team_away}
          </strong>

          <div style={{ marginTop: 6 }}>
            <input
              type="number"
              placeholder="Local"
              value={results[m.id]?.home ?? ""}
              onChange={(e) =>
                setResults({
                  ...results,
                  [m.id]: {
                    ...results[m.id],
                    home: Number(e.target.value)
                  }
                })
              }
            />

            <input
              type="number"
              placeholder="Visitante"
              value={results[m.id]?.away ?? ""}
              onChange={(e) =>
                setResults({
                  ...results,
                  [m.id]: {
                    ...results[m.id],
                    away: Number(e.target.value)
                  }
                })
              }
            />

            <button
              onClick={() =>
                updateResult(
                  m.id,
                  results[m.id]?.home ?? 0,
                  results[m.id]?.away ?? 0
                )
              }
            >
              Guardar resultado
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}