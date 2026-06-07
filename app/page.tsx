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

/**
 * 🧠 Normalizador de nombres
 */
const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()

/**
 * 🏳️ MAPA DE PAÍSES (CLAVES SEGURAS)
 */
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
  inglaterra: "GB-ENG",
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

    const now = new Date()

    const current = data.find((m) => new Date(m.match_date) >= now)

    if (current?.rounds?.name) {
      setPhaseName(current.rounds.name)
    }
  }

  const Flag = ({ team }: { team: string }) => {
    const key = normalize(team)
    const code = countryMap[key]

    if (!code) {
      return <span style={{ fontSize: 18 }}>⚽</span>
    }

    return (
      <ReactCountryFlag
        countryCode={code}
        svg
        style={{
          width: 22,
          height: 22,
          display: "inline-block"
        }}
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
                <span>{m.team_home}</span>
              </div>

              <div style={styles.score}>
                {m.goals_home ?? "-"} : {m.goals_away ?? "-"}
              </div>

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