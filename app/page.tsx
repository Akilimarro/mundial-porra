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
  rounds?: {
    name: string
  }
}

const countryMap: Record<string, string> = {
  España: "ES",
  France: "FR",
  Francia: "FR",
  Germany: "DE",
  Alemania: "DE",
  Brazil: "BR",
  Brasil: "BR",
  Mexico: "MX",
  México: "MX",
  "South Africa": "ZA",
  Sudafrica: "ZA",
  Argentina: "AR",
  England: "GB",
  Inglaterra: "GB",
  Italy: "IT",
  Italia: "IT",
  Portugal: "PT",
  Netherlands: "NL"
}

export default function Home() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [phaseName, setPhaseName] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) router.push("/login")
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*, rounds(name)")
      .order("match_date", { ascending: true })

    if (!data) return

    setMatches(data)

    // 🔥 calcular fase actual (por fecha más reciente futura)
    const now = new Date()

    const current = data.find((m) => new Date(m.match_date) >= now)

    if (current?.rounds?.name) {
      setPhaseName(current.rounds.name)
    }
  }

  const Flag = ({ team }: { team: string }) => {
    const code = countryMap[team]

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
      <div style={styles.header}>
        <h1>🏆 Mundial Porra</h1>
        <p style={{ opacity: 0.7 }}>
          {phaseName ? `📅 ${phaseName}` : "Cargando fase..."}
        </p>
      </div>

      <div style={styles.container}>
        {matches.map((m) => (
          <div key={m.id} style={styles.card}>
            <div style={styles.match}>
              <div style={styles.team}>
                <Flag team={m.team_home} />
                {m.team_home}
              </div>

              <div style={styles.score}>
                {m.goals_home ?? "-"} : {m.goals_away ?? "-"}
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
  page: {
    minHeight: "100vh",
    background: "#000",
    color: "white",
    padding: 16,
    fontFamily: "sans-serif"
  },
  header: {
    textAlign: "center",
    marginBottom: 20
  },
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
    gridTemplateColumns: "1fr 80px 1fr",
    alignItems: "center"
  },
  team: {
    display: "flex",
    gap: 8,
    alignItems: "center"
  },
  teamRight: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  score: {
    textAlign: "center",
    fontWeight: "bold"
  }
}