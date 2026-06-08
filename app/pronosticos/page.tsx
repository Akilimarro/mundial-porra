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
  round_id: number
}

type Prediction = {
  match_id: number
  predicted_home: number
  predicted_away: number
}

type PredictionsMap = Record<number, Prediction>

type User = {
  id: number
  username: string
}

const normalize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()

// 🌍 mismo mapa que HOME
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
  inglaterra: "GB",
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

export default function PronosticosPage() {
  const router = useRouter()

  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<PredictionsMap>({})
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) return router.push("/login")

    const u = JSON.parse(stored)
    setUser(u)

    loadMatches()
  }, [])

  const loadMatches = async () => {
    const now = new Date()

    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date")

    if (!data) return

    const next = data.find((m) => new Date(m.match_date) > now)
    if (!next) return

    const roundMatches = data.filter((m) => m.round_id === next.round_id)

    setMatches(roundMatches)
  }

  const update = (id: number, field: keyof Prediction, value: number) => {
    setPredictions((prev) => ({
      ...prev,
      [id]: {
        match_id: id,
        predicted_home:
          field === "predicted_home"
            ? value
            : prev[id]?.predicted_home ?? 0,
        predicted_away:
          field === "predicted_away"
            ? value
            : prev[id]?.predicted_away ?? 0
      }
    }))
  }

  const save = async () => {
    if (!user) return

    for (const p of Object.values(predictions)) {
      await supabase.from("predictions").upsert({
        ...p,
        user_id: user.id
      })
    }

    alert("Guardado ✅")
  }

  const Flag = ({ team }: { team: string }) => {
    const code = countryMap[normalize(team)]
    if (!code) return <span>⚽</span>

    return (
      <ReactCountryFlag
        countryCode={code}
        svg
        style={{ width: 22, height: 22 }}
      />
    )
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>✍️ Pronósticos</h1>

        <button onClick={() => router.push("/")} style={styles.back}>
          ⬅ Volver
        </button>
      </div>

      <div style={styles.container}>
        {matches.map((m) => (
          <div key={m.id} style={styles.card}>
            <div style={styles.date}>{formatDate(m.match_date)}</div>

            <div style={styles.match}>
              <div style={styles.team}>
                <Flag team={m.team_home} />
                {m.team_home}
              </div>

              {/* 🎯 AQUÍ LA MEJORA CLAVE */}
              <div style={styles.center}>
                <input
                  type="number"
                  style={styles.input}
                  onChange={(e) =>
                    update(m.id, "predicted_home", Number(e.target.value))
                  }
                />

                <span style={{ margin: "0 6px" }}>:</span>

                <input
                  type="number"
                  style={styles.input}
                  onChange={(e) =>
                    update(m.id, "predicted_away", Number(e.target.value))
                  }
                />
              </div>

              <div style={styles.teamRight}>
                {m.team_away}
                <Flag team={m.team_away} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={save} style={styles.save}>
        💾 Guardar pronósticos
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#000",
    color: "white",
    padding: 16
  },
  header: {
    textAlign: "center",
    marginBottom: 20
  },
  back: {
    marginTop: 10,
    padding: "6px 12px",
    background: "#444",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer"
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
  date: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8
  },
  match: {
    display: "grid",
    gridTemplateColumns: "1fr 120px 1fr",
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
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  input: {
    width: 40,
    textAlign: "center",
    background: "#111",
    border: "1px solid #333",
    color: "white",
    borderRadius: 6,
    padding: 4
  },
  save: {
    marginTop: 20,
    padding: "8px 16px",
    background: "#1f6feb",
    border: "none",
    borderRadius: 8,
    color: "white",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    cursor: "pointer"
  }
}