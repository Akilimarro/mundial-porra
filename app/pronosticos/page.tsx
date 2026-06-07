"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Match = {
  id: number
  team_home: string
  team_away: string
  match_date: string
  round_id: number
}

type Prediction = {
  match_id: number
  predicted_home: number
  predicted_away: number
}

type User = {
  id: number
}

export default function PronosticosPage() {
  const router = useRouter()

  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({})
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) return router.push("/login")

    const u = JSON.parse(stored)
    setUser(u)

    loadMatches(u.id)
  }, [])

  const loadMatches = async (userId: number) => {
    // 🔥 obtener próxima ronda (no empezada)
    const now = new Date()

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true })

    if (!matchesData) return

    const nextMatch = matchesData.find(
      (m) => new Date(m.match_date) > now
    )

    if (!nextMatch) return

    const roundId = nextMatch.round_id

    const roundMatches = matchesData.filter(
      (m) => m.round_id === roundId
    )

    setMatches(roundMatches)

    // 🔥 cargar predicciones existentes
    const { data: predData } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId)

    const map: Record<number, Prediction> = {}

    predData?.forEach((p) => {
      map[p.match_id] = p
    })

    setPredictions(map)
  }

  const updatePrediction = (
    matchId: number,
    field: "home" | "away",
    value: number
  ) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        match_id: matchId,
        predicted_home:
          field === "home" ? value : prev[matchId]?.predicted_home ?? 0,
        predicted_away:
          field === "away" ? value : prev[matchId]?.predicted_away ?? 0
      }
    }))
  }

  const save = async () => {
    if (!user) return

    for (const p of Object.values(predictions)) {
      await supabase.from("predictions").upsert({
        ...p,
        user_id: user.id
      })
    }

    alert("Guardado ✅")
  }

  return (
    <div style={{ padding: 20, background: "#000", color: "#fff" }}>
      <h1>✍️ Pronósticos</h1>

      {matches.map((m) => {
        const p = predictions[m.id]

        return (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <div>
              {m.team_home} vs {m.team_away}
            </div>

            <input
              type="number"
              placeholder="0"
              value={p?.predicted_home ?? ""}
              onChange={(e) =>
                updatePrediction(m.id, "home", Number(e.target.value))
              }
            />

            <input
              type="number"
              placeholder="0"
              value={p?.predicted_away ?? ""}
              onChange={(e) =>
                updatePrediction(m.id, "away", Number(e.target.value))
              }
            />
          </div>
        )
      })}

      <button onClick={save}>💾 Guardar</button>
    </div>
  )
}