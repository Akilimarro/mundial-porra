"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function MatchesAdmin() {
  const [matches, setMatches] = useState<any[]>([])

  const [form, setForm] = useState({
    team_home: "",
    team_away: "",
    match_date: "",
    round_id: ""
  })

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true })

    setMatches(data || [])
  }

  const createMatch = async () => {
    await supabase.from("matches").insert([form])
    setForm({
      team_home: "",
      team_away: "",
      match_date: "",
      round_id: ""
    })
    load()
  }

  const updateResult = async (id: string, home: number, away: number) => {
    await supabase
      .from("matches")
      .update({
        goals_home: home,
        goals_away: away
      })
      .eq("id", id)

    load()
  }

  return (
    <div>
      <h1>⚽ Admin Partidos</h1>

      {/* CREAR PARTIDO */}
      <div style={{ marginBottom: 20 }}>
        <h3>Crear partido</h3>

        <input
          placeholder="Local"
          value={form.team_home}
          onChange={(e) => setForm({ ...form, team_home: e.target.value })}
        />

        <input
          placeholder="Visitante"
          value={form.team_away}
          onChange={(e) => setForm({ ...form, team_away: e.target.value })}
        />

        <input
          type="datetime-local"
          value={form.match_date}
          onChange={(e) => setForm({ ...form, match_date: e.target.value })}
        />

        <input
          placeholder="round_id"
          value={form.round_id}
          onChange={(e) => setForm({ ...form, round_id: e.target.value })}
        />

        <button onClick={createMatch}>Crear</button>
      </div>

      {/* LISTADO */}
      <h3>Partidos</h3>

      {matches.map((m) => (
        <div key={m.id} style={{ marginBottom: 10 }}>
          <strong>
            {m.team_home} vs {m.team_away}
          </strong>

          <div>
            <input
              type="number"
              placeholder="local"
              defaultValue={m.goals_home}
              onChange={(e) =>
                (m._home = Number(e.target.value))
              }
            />

            <input
              type="number"
              placeholder="visitante"
              defaultValue={m.goals_away}
              onChange={(e) =>
                (m._away = Number(e.target.value))
              }
            />

            <button
              onClick={() =>
                updateResult(m.id, m._home, m._away)
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