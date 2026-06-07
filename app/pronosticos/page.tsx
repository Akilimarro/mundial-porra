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

type Prediction = {
  match_id: number
  predicted_home: number
  predicted_away: number
}

type PredictionsMap = Record<number, Prediction>

export default function PronosticosPage() {
  const router = useRouter()

  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<PredictionsMap>({})
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) return router.push("/login")

    const u = JSON.parse(stored)
    setUser(u)

    loadMatches()
  }, [])

  const loadMatches = async () => {
    const now = new Date()

    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date")

    if (!data) return

    const next = data.find((m) => new Date(m.match_date) > now)
    if (!next) return

    setMatches(data.filter((m) => m.round_id === next.round_id))
  }

  const update = (id: number, field: keyof Prediction, value: number) => {
    setPredictions((prev) => ({
      ...prev,
      [id]: {
        match_id: id,
        predicted_home:
          field === "predicted_home"
            ? value
            : prev[id]?.predicted_home ?? 0,
        predicted_away:
          field === "predicted_away"
            ? value
            : prev[id]?.predicted_away ?? 0
      }
    }))
  }

  const save = async () => {
    for (const p of Object.values(predictions)) {
      await supabase.from("predictions").upsert({
        ...p,
        user_id: user.id
      })
    }

    alert("Guardado ✅")
  }

  const Flag = ({ team }: { team: string }) => (
    <ReactCountryFlag
      countryCode="ES"
      svg
      style={{ width: 20 }}
    />
  )

  return (
    <div style={{ background: "#000", color: "#fff", padding: 16 }}>
      <h1>✍️ Pronósticos</h1>

      <button onClick={() => router.push("/")} style={{ marginBottom: 10 }}>
        ⬅ Volver
      </button>

      {matches.map((m) => (
        <div key={m.id} style={{ marginBottom: 10 }}>
          {m.team_home} vs {m.team_away}

          <div>
            <input onChange={(e) => update(m.id, "predicted_home", Number(e.target.value))} />
            :
            <input onChange={(e) => update(m.id, "predicted_away", Number(e.target.value))} />
          </div>
        </div>
      ))}

      <button style={{ padding: "6px 12px" }} onClick={save}>
        Guardar
      </button>
    </div>
  )
}