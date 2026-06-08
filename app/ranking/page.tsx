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

export default function RankingPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase
      .from("leaderboard")
      .select("*")

    if (data) setRows(data)
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
        <button onClick={() => router.push("/")} style={styles.back}>
          ⬅ Volver
        </button>

        <h1>🏆 Ranking</h1>
      </div>

      <div style={styles.container}>
        {rows.map((r) => (
          <div key={r.user_id} style={styles.card}>
            <div style={styles.row}>
              <div style={styles.left}>
                <span style={styles.medal}>{medal(r.position)}</span>
                {r.username}
              </div>

              <div style={styles.points}>{r.total_points} pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#000",
    color: "white",
    minHeight: "100vh",
    padding: 16
  },
  header: {
    textAlign: "center",
    marginBottom: 20
  },
  back: {
    marginBottom: 10,
    background: "#444",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "6px 12px"
  },
  container: {
    maxWidth: 600,
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
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  left: {
    display: "flex",
    gap: 10,
    alignItems: "center"
  },
  medal: {
    fontSize: 20
  },
  points: {
    fontWeight: "bold"
  }
}