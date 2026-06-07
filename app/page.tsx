"use client"

import { useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")

      console.log(data, error)
    }

    fetchMatches()
  }, [])

  return <h1>Porra Mundial ⚽</h1>
}