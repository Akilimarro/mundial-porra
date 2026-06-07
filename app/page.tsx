"use client"

import { useEffect, useState } from "react"
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

const countryMap: Record<string, string> = {
  España: "ES",
  Spain: "ES",
  Francia: "FR",
  France: "FR",
  Alemania: "DE",
  Germany: "DE",
  Brasil: "BR",
  Brazil: "BR",
  Argentina: "AR",
  Mexico: "MX",
  México: "MX",
  "South Africa": "ZA",
  Sudafrica: "ZA",
  "Sudáfrica": "ZA",
  Inglaterra: "GB",
  England: "GB",
  Italia: "IT",
  Italy: "IT",
  Portugal: "PT",
  Netherlands: "NL",
  "Países Bajos": "NL"
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true })

    setMatches(data || [])
  }

  const Flag = ({ team }: { team: string }) => {
    const code = countryMap[team]

    if (!code) return <span style={{ fontSize: 18 }}>⚽</span>

    return (
      <ReactCountryFlag
        countryCode={code}
        svg
        style={{
          width: "1.6em",
          height: "1.6em",
        }}
      />
    )
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏆 Mundial Porra</h1>
        <p style={styles.subtitle}>Pronósticos en vivo</p>
      </div>

      {/* MATCH LIST */}
      <div style={styles.container}>
        {matches.map((m) => (
          <div key={m.id} style={styles.card}>
            <div style={styles.date}>
              {new Date(m.match_date).toLocaleString()}
            </div>

            <div style={styles.match}>
              {/* HOME */}
              <div style={styles.teamLeft}>
                <Flag team={m.team_home} />
                <span>{m.team_home}</span>
              </div>

              {/* SCORE */}
              <div style={styles.score}>
                {m.goals_home ?? "-"} : {m.goals_away ?? "-"}
              </div>

              {/* AWAY */}
              <div style={styles.teamRight}>
                <span>{m.team_away}</span>
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
    background: "radial-gradient(circle at top, #111, #000)",
    color: "white",
    padding: 20,
    fontFamily: "sans-serif"
  },

  header: {
    textAlign: "center",
    marginBottom: 30
  },

  title: {
    fontSize: 38,
    margin: 0
  },

  subtitle: {
    opacity: 0.6
  },

  container: {
    maxWidth: 720,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 12
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 16,
    backdropFilter: "blur(10px)"
  },

  date: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 10
  },

  match: {
    display: "grid",
    gridTemplateColumns: "1fr 90px 1fr",
    alignItems: "center"
  },

  teamLeft: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    fontSize: 16
  },

  teamRight: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    fontSize: 16,
    textAlign: "right"
  },

  score: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 90
  }
}