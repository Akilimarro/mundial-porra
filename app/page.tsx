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

// 🌍 MAPA COMPLETO
const countryMap: Record<string, string> = {
  alemania: "DE",
  "arabia saudita": "SA",
  argelia: "DZ",
  argentina: "AR",
  australia: "AU",
  austria: "AT",
  belgica: "BE",
  "bosnia y herzegovina": "BA",
  brasil: "BR",
  "cabo verde": "CV",
  canada: "CA",
  catar: "QA",
  colombia: "CO",
  "corea del sur": "KR",
  "costa de marfil": "CI",
  croacia: "HR",
  curazao: "CW",
  ecuador: "EC",
  egipto: "EG",
  escocia: "GB-SCT",
  espana: "ES",
  "estados unidos": "US",
  francia: "FR",
  ghana: "GH",
  haiti: "HT",
  inglaterra: "GB",
  irak: "IQ",
  iran: "IR",
  japon: "JP",
  jordania: "JO",
  marruecos: "MA",
  mexico: "MX",
  noruega: "NO",
  "nueva zelanda": "NZ",
  "paises bajos": "NL",
  panama: "PA",
  paraguay: "PY",
  portugal: "PT",
  "republica checa": "CZ",
  "republica democratica del congo": "CD",
  senegal: "SN",
  sudafrica: "ZA",
  suecia: "SE",
  suiza: "CH",
  tunez: "TN",
  turquia: "TR",
  uruguay: "UY",
  uzbekistan: "UZ"
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
      .select("*")
      .order("match_date")

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
    if (!p) return "(- : -)"
    return `(${p.predicted_home} : ${p.predicted_away})`
  }

  const logout = () => {
    localStorage.removeItem("user")
    router.replace("/login")
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
        <h1>🏆 Mundial Porra</h1>

        {user && (
          <div style={styles.userBar}>
            👤 {user.username}
            <button onClick={logout} style={styles.logout}>
              Salir
            </button>
          </div>
        )}

        <button
          style={styles.mainButton}
          onClick={() => router.push("/pronosticos")}
        >
          ✍️ Pronósticos
        </button>
      </div>

      <div style={styles.container}>
        {matches.map((m) => (
          <div key={m.id} style={styles.card}>
            <div style={styles.date}>{formatDate(m.match_date)}</div>

            <div style={styles.match}>
              <div style={styles.team}>
                <Flag team={m.team_home} />
                {m.team_home}
              </div>

              <div style={styles.center}>
                <div style={styles.score}>
                  {m.goals_home ?? "-"} : {m.goals_away ?? "-"}
                </div>

                <div style={styles.prediction}>
                  {getPrediction(m.id)}
                </div>
              </div>

              <div style={styles.teamRight}>
                {m.team_away}
                <Flag team={m.team_away} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: "#000", color: "#fff", minHeight: "100vh", padding: 16 },
  header: { textAlign: "center", marginBottom: 20 },
  userBar: { display: "flex", justifyContent: "center", gap: 10 },
  logout: { background: "#ff4d4d", border: "none", padding: "4px 8px" },
  mainButton: {
    marginTop: 10,
    padding: "6px 12px",
    background: "#1f6feb",
    borderRadius: 6,
    border: "none"
  },
  container: { maxWidth: 700, margin: "0 auto" },
  card: { background: "#111", padding: 12, marginBottom: 10, borderRadius: 8 },
  match: {
    display: "grid",
    gridTemplateColumns: "1fr 120px 1fr",
    alignItems: "center"
  },
  team: { display: "flex", gap: 6 },
  teamRight: { display: "flex", justifyContent: "flex-end", gap: 6 },
  center: { textAlign: "center" },
  score: { fontWeight: "bold" },
  prediction: { fontSize: 12, opacity: 0.7 },
  date: { fontSize: 12, opacity: 0.6 }
}