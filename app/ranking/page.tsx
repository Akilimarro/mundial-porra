"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Row = {
  user_id: number
  username: string
  total_points: number
  position: number
}

type Round = {
  id: number
  name: string
}

export default function RankingPage() {
  const router = useRouter()

  const [rows, setRows] = useState<Row[]>([])
  const [rounds, setRounds] = useState<Round[]>([])
  const [selectedRound, setSelectedRound] = useState<number | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const u = JSON.parse(stored)
      setUserId(u.id)
    }

    loadRounds()
    loadGlobal()
  }, [])

  const loadRounds = async () => {
    const { data } = await supabase.from("rounds").select("*").order("id")
    if (data) setRounds(data)
  }

  const loadGlobal = async () => {
    const { data } = await supabase.from("leaderboard").select("*")
    if (data) setRows(data)
    setSelectedRound(null)
  }

  const loadRound = async (roundId: number) => {
    const { data } = await supabase
      .from("round_points")
      .select("user_id, users(username), points")
      .eq("round_id", roundId)

    if (!data) return

    const sorted = data
      .map((r: any) => ({
        user_id: r.user_id,
        username: r.users.username,
        total_points: r.points
      }))
      .sort((a, b) => b.total_points - a.total_points)

    let pos = 1
    const withPos = sorted.map((r, i) => {
      if (i > 0 && r.total_points < sorted[i - 1].total_points) {
        pos = i + 1
      }
      return { ...r, position: pos }
    })

    setRows(withPos)
    setSelectedRound(roundId)
  }

  const medal = (pos: number) => {
    if (pos === 1) return "🥇"
    if (pos === 2) return "🥈"
    if (pos === 3) return "🥉"
    return ""
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.buttonSecondary} onClick={() => router.push("/")}>
          ⬅ Volver
        </button>

        <h1>🏆 Ranking</h1>

        <div style={styles.selector}>
          <button style={styles.button} onClick={loadGlobal}>
            Global
          </button>

          {rounds.map((r) => (
            <button
              key={r.id}
              style={styles.button}
              onClick={() => loadRound(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.container}>
        {rows.map((r) => (
          <div
            key={r.user_id}
            style={{
              ...styles.card,
              border: r.user_id === userId ? "1px solid #1f6feb" : "none"
            }}
          >
            <div style={styles.row}>
              <div style={styles.left}>
                <span>{medal(r.position)}</span>
                {r.username}
              </div>

              <div>{r.total_points} pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: "#000", color: "white", minHeight: "100vh", padding: 16 },
  header: { textAlign: "center", marginBottom: 20 },
  container: { maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 },

  selector: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10
  },

  button: {
    background: "#1f6feb",
    border: "none",
    borderRadius: 6,
    color: "white",
    padding: "6px 10px",
    cursor: "pointer"
  },
  buttonSecondary: {
    background: "#444",
    border: "none",
    borderRadius: 6,
    color: "white",
    padding: "6px 10px",
    cursor: "pointer"
  },

  card: { background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 10 },
  row: { display: "flex", justifyContent: "space-between" },
  left: { display: "flex", gap: 10 }
}