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
  predicted_home: number | null
  predicted_away: number | null
}

type PredictionsMap = Record<number, Prediction>

type User = {
  id: number
  username: string
}

const normalize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()

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

    loadData(u.id)
  }, [])

  // 🔥 SOLO RONDA ACTIVA
  const loadData = async (userId: number) => {
    const { data: matchesData } = await supabase
      .from("matches")
      .select("*, rounds(active)")
      .eq("rounds.active", true)
      .order("match_date")

    if (!matchesData) return

    setMatches(matchesData)

    const { data: preds } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId)

    const map: PredictionsMap = {}

    matchesData.forEach((m) => {
      const existing = preds?.find((p) => p.match_id === m.id)

      map[m.id] = {
        match_id: m.id,
        predicted_home: existing?.predicted_home ?? null,
        predicted_away: existing?.predicted_away ?? null
      }
    })

    setPredictions(map)
  }

  // 🔒 BLOQUEO 30 MIN
  const isLocked = (date: string) => {
    const matchTime = new Date(date).getTime()
    const now = new Date().getTime()

    return matchTime - now <= 30 * 60 * 1000
  }

  const update = (id: number, field: keyof Prediction, value: string) => {
    if (value === "") {
      setPredictions((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: null }
      }))
      return
    }

    const num = Number(value)
    if (num < 0) return

    setPredictions((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: num }
    }))
  }

  const save = async () => {
    if (!user) return

    for (const m of matches) {
      if (isLocked(m.match_date)) continue

      const p = predictions[m.id]

      if (!p || p.predicted_home === null || p.predicted_away === null)
        continue

      await supabase.from("predictions").upsert({
        match_id: p.match_id,
        predicted_home: p.predicted_home,
        predicted_away: p.predicted_away,
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

        <div style={styles.topButtons}>
          <button onClick={() => router.push("/")} style={styles.back}>
            ⬅ Volver
          </button>

          <button onClick={save} style={styles.save}>
            💾 Guardar
          </button>
        </div>
      </div>

      <div style={styles.container}>
        {matches.map((m) => {
          const p = predictions[m.id]
          const locked = isLocked(m.match_date)

          return (
            <div
              key={m.id}
              style={{
                ...styles.card,
                opacity: locked ? 0.5 : 1
              }}
            >
              <div style={styles.date}>{formatDate(m.match_date)}</div>

              <div style={styles.match}>
                <div style={styles.team}>
                  <Flag team={m.team_home} />
                  {m.team_home}
                </div>

                <div style={styles.center}>
                  <input
                    type="number"
                    min="0"
                    disabled={locked}
                    value={p?.predicted_home ?? ""}
                    placeholder="-"
                    style={styles.input}
                    onChange={(e) =>
                      update(m.id, "predicted_home", e.target.value)
                    }
                  />

                  <span style={{ margin: "0 6px" }}>:</span>

                  <input
                    type="number"
                    min="0"
                    disabled={locked}
                    value={p?.predicted_away ?? ""}
                    placeholder="-"
                    style={styles.input}
                    onChange={(e) =>
                      update(m.id, "predicted_away", e.target.value)
                    }
                  />
                </div>

                <div style={styles.teamRight}>
                  {m.team_away}
                  <Flag team={m.team_away} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
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
  header: { textAlign: "center", marginBottom: 20 },
  topButtons: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginTop: 10
  },
  back: {
    padding: "6px 12px",
    background: "#444",
    borderRadius: 6,
    color: "white",
    border: "none"
  },
  save: {
    padding: "6px 12px",
    background: "#1f6feb",
    borderRadius: 6,
    color: "white",
    border: "none"
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
  date: { fontSize: 12, opacity: 0.6, marginBottom: 8 },
  match: {
    display: "grid",
    gridTemplateColumns: "1fr 120px 1fr",
    alignItems: "center"
  },
  team: { display: "flex", gap: 8, alignItems: "center" },
  teamRight: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  center: { display: "flex", justifyContent: "center" },
  input: {
    width: 40,
    textAlign: "center",
    background: "#222",
    border: "1px solid #555",
    color: "white",
    borderRadius: 6,
    padding: 4
  }
}