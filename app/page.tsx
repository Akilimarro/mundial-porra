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
}

type Prediction = {
  match_id: number
  predicted_home: number | null
  predicted_away: number | null
}

type User = {
  id: number
  username: string
}

const normalize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()

const countryMap: Record<string, string> = {
  espana: "ES",
  francia: "FR",
  brasil: "BR",
  argentina: "AR",
  mexico: "MX",
  "estados unidos": "US",
  alemania: "DE",
  portugal: "PT",
  italia: "IT",
  inglaterra: "GB",
  marruecos: "MA",
  japon: "JP",
  "corea del sur": "KR",
  sudafrica: "ZA"
}

export default function Home() {
  const router = useRouter()

  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({})
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const u = JSON.parse(stored)
      setUser(u)
      loadPredictions(u.id)
    }

    loadMatches()
  }, [])

  const loadMatches = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*, rounds(active)")
      .eq("rounds.active", true)
      .order("match_date")

    if (data) setMatches(data)
  }

  const loadPredictions = async (userId: number) => {
    const { data } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId)

    const map: Record<number, Prediction> = {}
    data?.forEach((p) => (map[p.match_id] = p))
    setPredictions(map)
  }

  const logout = () => {
    localStorage.removeItem("user")
    window.location.reload()
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

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>🏆 Mundial - Partidos</h1>

        <div style={styles.buttons}>
          {!user && (
            <button style={styles.button} onClick={() => router.push("/login")}>
              Login
            </button>
          )}

          {user && (
            <>
              <span>👤 {user.username}</span>

              <button style={styles.button} onClick={() => router.push("/pronosticos")}>
                Pronósticos
              </button>

              <button style={styles.button} onClick={() => router.push("/ranking")}>
                Ranking
              </button>

              <button style={styles.buttonSecondary} onClick={logout}>
                Salir
              </button>
            </>
          )}
        </div>
      </div>

      <div style={styles.container}>
        {matches.map((m) => {
          const p = predictions[m.id]

          return (
            <div key={m.id} style={styles.card}>
              <div style={styles.date}>{formatDate(m.match_date)}</div>

              <div style={styles.match}>
                <div style={styles.team}>
                  <Flag team={m.team_home} />
                  {m.team_home}
                </div>

                <div style={styles.center}>
                  {m.goals_home ?? "-"} : {m.goals_away ?? "-"}
                  <div style={styles.pred}>
                    ({p ? `${p.predicted_home}-${p.predicted_away}` : "-"})
                  </div>
                </div>

                <div style={styles.teamRight}>
                  {m.team_away}
                  <Flag team={m.team_away} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: "#000", color: "white", minHeight: "100vh", padding: 16 },
  header: { textAlign: "center", marginBottom: 20 },
  buttons: { display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" },

  button: {
    background: "#1f6feb",
    border: "none",
    borderRadius: 6,
    color: "white",
    padding: "6px 12px",
    cursor: "pointer"
  },
  buttonSecondary: {
    background: "#444",
    border: "none",
    borderRadius: 6,
    color: "white",
    padding: "6px 12px",
    cursor: "pointer"
  },

  container: { maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 },
  card: { background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 10 },
  date: { fontSize: 12, opacity: 0.6 },
  match: { display: "grid", gridTemplateColumns: "1fr 120px 1fr", alignItems: "center" },
  team: { display: "flex", gap: 8, alignItems: "center" },
  teamRight: { display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" },
  center: { textAlign: "center" },
  pred: { fontSize: 12, opacity: 0.7 }
}