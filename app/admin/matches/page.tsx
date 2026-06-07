"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function MatchesAdmin() {
  const [matches, setMatches] = useState<any[]>([])
  const [rounds, setRounds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    team_home: "",
    team_away: "",
    match_date: "",
    round_id: ""
  })

  // --------------------
  // LOAD DATA
  // --------------------
  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    const [{ data: m }, { data: r }] = await Promise.all([
      supabase.from("matches").select("*").order("match_date"),
      supabase.from("rounds").select("*").order("order_number")
    ])

    setMatches(m || [])
    setRounds(r || [])
  }

  // --------------------
  // CREATE MATCH
  // --------------------
  const createMatch = async () => {
    if (!form.team_home || !form.team_away || !form.round_id) {
      alert("Completa todos los campos")
      return
    }

    setLoading(true)

    const lockDate = new Date(form.match_date)
    lockDate.setDate(lockDate.getDate() - 1)
    lockDate.setHours(23, 59, 59)

    const { error } = await supabase.from("matches").insert([
      {
        team_home: form.team_home,
        team_away: form.team_away,
        match_date: form.match_date,
        lock_date: lockDate.toISOString(),
        round_id: form.round_id,
      }
    ])

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Error creando partido")
      return
    }

    setForm({
      team_home: "",
      team_away: "",
      match_date: "",
      round_id: ""
    })

    loadAll()
  }

  // --------------------
  // UPDATE RESULT
  // --------------------
  const updateResult = async (
    id: string,
    home: number,
    away: number
  ) => {
    await supabase
      .from("matches")
      .update({
        goals_home: home,
        goals_away: away
      })
      .eq("id", id)

    loadAll()
  }

  // --------------------
  // UI
  // --------------------
  return (
    <div>
      <h1>⚽ Admin Partidos</h1>

      {/* FORM */}
      <div style={{
        padding: 16,
        border: "1px solid #ddd",
        marginBottom: 20
      }}>
        <h3>Crear partido</h3>

        <input
          placeholder="Local"
          value={form.team_home}
          onChange={(e) =>
            setForm({ ...form, team_home: e.target.value })
          }
        />

        <input
          placeholder="Visitante"
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

        {/* RONDAS (FIX UUID BUG) */}
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

      {matches.map((m) => (
        <div key={m.id} style={{ marginBottom: 10 }}>
          <strong>
            {m.team_home} vs {m.team_away}
          </strong>

          <div>
            <input
              type="number"
              placeholder="L"
              defaultValue={m.goals_home}
              onChange={(e) => (m._h = Number(e.target.value))}
            />

            <input
              type="number"
              placeholder="V"
              defaultValue={m.goals_away}
              onChange={(e) => (m._a = Number(e.target.value))}
            />

            <button
              onClick={() =>
                updateResult(m.id, m._h, m._a)
              }
            >
              Guardar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}