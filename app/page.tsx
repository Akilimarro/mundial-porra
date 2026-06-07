"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true })

      if (error) {
        console.error(error)
      } else {
        setMatches(data || [])
      }
    }

    fetchMatches()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>⚽ Porra Mundial</h1>

      <h2>Partidos</h2>

      {matches.length === 0 && <p>No hay partidos todavía</p>}

      {matches.map((m) => (
        <div key={m.id} style={{ marginBottom: 12 }}>
          <strong>
            {m.team_home} vs {m.team_away}
          </strong>

          <div>
            {m.goals_home ?? "-"} : {m.goals_away ?? "-"}
          </div>

          <small>{new Date(m.match_date).toLocaleString()}</small>
        </div>
      ))}
    </div>
  )
}