"use client"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export default function Home() {
  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")

      console.log("matches:", data)
      console.log("error:", error)
    }

    fetchMatches()
  }, [])

  return (
    <div>
      <h1>⚽ Porra Mundial</h1>
    </div>
  )
}