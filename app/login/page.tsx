"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Match = {
  id: number
  team_home: string
  team_away: string
  match_date: string
  goals_home: number | null
  goals_away: number | null
  round_id: number
}

export default function Home() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    const now = new Date()

    // 🧠 fase actual = ronda más cercana activa por fecha
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true })

    if (!data) return

    const currentMatches = data.filter((m) => {
      const matchDate = new Date(m.match_date)

      // mostramos solo próximos + recientes (fase actual simplificada)
      return matchDate >= new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3)
    })

    setMatches(currentMatches)
  }

  const goLogin = () => router.push("/login")

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>🏆 Mundial Porra</h1>

        <button onClick={goLogin} style={styles.loginBtn}>
          🔐 Login
        </button>
      </div>

      <div style={styles.container}>
        <h2>📅 Fase actual</h2>

        {matches.map((m) => (
          <div key={m.id} style={styles.card}>
            <div style={styles.match}>
              <div>{m.team_home}</div>

              <div style={styles.score}>
                {m.goals_home ?? "-"} : {m.goals_away ?? "-"}
              </div>

              <div style={{ textAlign: "right" }}>{m.team_away}</div>
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  loginBtn: {
    padding: "8px 12px",
    background: "#222",
    color: "white",
    border: "1px solid #444",
    borderRadius: 8,
    cursor: "pointer"
  },
  container: {
    marginTop: 20,
    maxWidth: 700,
    marginLeft: "auto",
    marginRight: "auto"
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },
  match: {
    display: "grid",
    gridTemplateColumns: "1fr 80px 1fr",
    alignItems: "center"
  },
  score: {
    textAlign: "center",
    fontWeight: "bold"
  }
}