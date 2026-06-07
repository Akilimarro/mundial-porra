"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ReactCountryFlag from "react-country-flag"

type Match = {
  id: number
  team_home: string
  team_away: string
  match_date: string
  round_id: number
}

type User = {
  id: number
}

export default function PronosticosPage() {
  const router = useRouter()

  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<any>({})
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) return router.push("/login")

    const u = JSON.parse(stored)
    setUser(u)

    loadMatches(u.id)
  }, [])

  const loadMatches = async (userId: number) => {
    const now = new Date()

    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date")

    if (!data) return

    const next = data.find((m) => new Date(m.match_date) > now)
    if (!next) return

    const roundMatches = data.filter((m) => m.round_id === next.round_id)

    setMatches(roundMatches)
  }

  const update = (id: number, field: string, value: number) => {
    setPredictions((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  const save = async () => {
    if (!user) return

    for (const [matchId, p] of Object.entries(predictions)) {
      await supabase.from("predictions").upsert({
        match_id: Number(matchId),
        predicted_home: p.predicted_home ?? 0,
        predicted_away: p.predicted_away ?? 0,
        user_id: user.id
      })
    }

    alert("Guardado ✅")
  }

  return (
    <div style={{ padding: 20, background: "#000", color: "#fff" }}>
      <h1>✍️ Pronósticos</h1>

      {matches.map((m) => (
        <div key={m.id} style={{ marginBottom: 15 }}>
          <div>
            {m.team_home} vs {m.team_away}
          </div>

          <input
            type="number"
            onChange={(e) =>
              update(m.id, "predicted_home", Number(e.target.value))
            }
          />

          <input
            type="number"
            onChange={(e) =>
              update(m.id, "predicted_away", Number(e.target.value))
            }
          />
        </div>
      ))}

      <button onClick={save}>Guardar</button>
    </div>
  )
}