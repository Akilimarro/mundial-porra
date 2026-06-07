"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Match = {
  id: number
  team_home: string
  team_away: string
  match_date: string
  goals_home: number | null
  goals_away: number | null
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

  const flag = (team: string) => {
    const map: Record<string, string> = {
      "España": "🇪🇸",
      "Spain": "🇪🇸",
      "Francia": "🇫🇷",
      "France": "🇫🇷",
      "Alemania": "🇩🇪",
      "Germany": "🇩🇪",
      "Brasil": "🇧🇷",
      "Brazil": "🇧🇷",
      "Argentina": "🇦🇷",
      "Inglaterra": "🏴",
      "England": "🏴",
      "Italia": "🇮🇹",
      "Italy": "🇮🇹",
      "Portugal": "🇵🇹",
      "Netherlands": "🇳🇱",
      "Países Bajos": "🇳🇱"
    }

    return map[team] || "⚽"
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
              <div style={styles.team}>
                <span style={styles.flag}>{flag(m.team_home)}</span>
                <span>{m.team_home}</span>
              </div>

              <div style={styles.score}>
                {m.goals_home ?? "-"} : {m.goals_away ?? "-"}
              </div>

              <div style={styles.team}>
                <span>{m.team_away}</span>
                <span style={styles.flag}>{flag(m.team_away)}</span>
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
    fontSize: 36,
    margin: 0
  },

  subtitle: {
    opacity: 0.6
  },

  container: {
    maxWidth: 700,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 12
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
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
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 10
  },

  team: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 16
  },

  flag: {
    fontSize: 20
  },

  score: {
    fontSize: 22,
    fontWeight: "bold"
  }
}