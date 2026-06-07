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

type User = {
  id: number
}

const normalize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()

const countryMap: Record<string, string> = {
  espana: "ES",
  argentina: "AR",
  brasil: "BR",
  mexico: "MX",
  francia: "FR",
  alemania: "DE",
  inglaterra: "GB",
  portugal: "PT",
  italia: "IT",
  "estados unidos": "US",
  marruecos: "MA",
  japon: "JP",
  "corea del sur": "KR"
}

export default function PronosticosPage() {
  const router = useRouter()

  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<PredictionsMap>({})
  const [user, setUser] = useState<User | null>(null)

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

    const roundMatches = data.filter((m) => m.round_id === next.round_id)

    setMatches(roundMatches)
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
    if (!user) return

    for (const [matchId, p] of Object.entries(predictions)) {
      const pred = p as Prediction

      await supabase.from("predictions").upsert({
        match_id: Number(matchId),
        predicted_home: pred.predicted_home ?? 0,
        predicted_away: pred.predicted_away ?? 0,
        user_id: user.id
      })
    }

    alert("Guardado ✅")
  }

  const Flag = ({ team }: { team: string }) => {
    const code = countryMap[normalize(team)]
    if (!code) return <span>⚽</span>

    return (
      <ReactCountryFlag
        countryCode={code}
        svg
        style={{ width: 22, height: 22 }}
      />
    )
  }

  return (
    <div style={styles.page}>
      <h1>✍️ Pronósticos</h1>

      <div style={styles.container}>
        {matches.map((m) => (
          <div key={m.id} style={styles.card}>
            <div style={styles.match}>
              <div style={styles.team}>
                <Flag team={m.team_home} />
                {m.team_home}
              </div>

              <div style={styles.inputs}>
                <input
                  type="number"
                  onChange={(e) =>
                    update(m.id, "predicted_home", Number(e.target.value))
                  }
                />
                <span>:</span>
                <input
                  type="number"
                  onChange={(e) =>
                    update(m.id, "predicted_away", Number(e.target.value))
                  }
                />
              </div>

              <div style={styles.teamRight}>
                {m.team_away}
                <Flag team={m.team_away} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={save} style={styles.save}>
        💾 Guardar
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#000", color: "white", padding: 16 },
  container: {
    maxWidth: 700,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 10
  },
  match: {
    display: "grid",
    gridTemplateColumns: "1fr 120px 1fr",
    alignItems: "center"
  },
  team: { display: "flex", gap: 8, alignItems: "center" },
  teamRight: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  inputs: {
    display: "flex",
    justifyContent: "center",
    gap: 6
  },
  save: {
    marginTop: 20,
    padding: 10,
    background: "#1f6feb",
    border: "none",
    borderRadius: 8,
    color: "white",
    width: "100%"
  }
}