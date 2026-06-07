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
  goals_home: number | null
  goals_away: number | null
  round_id: number
  rounds?: { name: string }
}

type Prediction = {
  match_id: number
  predicted_home: number
  predicted_away: number
}

type User = {
  id: number
  username: string
}

const normalize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()

const countryMap: Record<string, string> = {
  espana: "ES",
  argentina: "AR",
  brasil: "BR",
  mexico: "MX",
  francia: "FR",
  alemania: "DE"
}

export default function Home() {
  const router = useRouter()

  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) return router.push("/login")

    const u = JSON.parse(stored)
    setUser(u)

    loadMatches()
    loadPredictions(u.id)
  }, [])

  const loadMatches = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*, rounds(name)")
      .order("match_date", { ascending: true })

    if (data) setMatches(data)
  }

  const loadPredictions = async (userId: number) => {
    const { data } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId)

    if (data) setPredictions(data)
  }

  const getPrediction = (matchId: number) => {
    const p = predictions.find((x) => x.match_id === matchId)
    if (!p) return "- : -"
    return `${p.predicted_home} : ${p.predicted_away}`
  }

  const logout = () => {
    localStorage.removeItem("user")
    router.replace("/login")
  }

  const Flag = ({ team }: { team: string }) => {
    const code = countryMap[normalize(team)]
    if (!code) return <span>⚽</span>
    return <ReactCountryFlag countryCode={code} svg style={{ width: 20 }} />
  }

  return (
    <div style={{ padding: 20, background: "#000", color: "#fff" }}>
      <h1>🏆 Mundial Porra</h1>

      {user && (
        <div style={{ marginBottom: 10 }}>
          👤 {user.username}
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      )}

      {/* BOTÓN NUEVO */}
      <button onClick={() => router.push("/pronosticos")}>
        ✍️ Editar Pronósticos
      </button>

      {matches.map((m) => (
        <div key={m.id} style={{ marginTop: 10 }}>
          <div>
            {m.team_home} vs {m.team_away}
          </div>

          <div>Resultado: {m.goals_home ?? "-"} : {m.goals_away ?? "-"}</div>

          {/* 🔥 PREDICCIÓN */}
          <div>Tu predicción: {getPrediction(m.id)}</div>
        </div>
      ))}
    </div>
  )
}