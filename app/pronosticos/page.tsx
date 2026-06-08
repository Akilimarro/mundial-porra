"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Match = {
  id: number;
  team_home: string;
  team_away: string;
  match_date: string;
};

type Prediction = {
  match_id: number;
  predicted_home: number | null;
  predicted_away: number | null;
};

// 🌍 FLAGS (MISMO SISTEMA QUE HOME)
const countryFlags: Record<string, string> = {
  alemania: "de",
  "arabia saudita": "sa",
  argelia: "dz",
  argentina: "ar",
  australia: "au",
  austria: "at",
  bélgica: "be",
  "bosnia y herzegovina": "ba",
  brasil: "br",
  "cabo verde": "cv",
  canadá: "ca",
  catar: "qa",
  colombia: "co",
  "corea del sur": "kr",
  "costa de marfil": "ci",
  croacia: "hr",
  curazao: "cw",
  ecuador: "ec",
  egipto: "eg",
  escocia: "gb-sct",
  españa: "es",
  "estados unidos": "us",
  francia: "fr",
  ghana: "gh",
  haití: "ht",
  inglaterra: "gb-eng",
  irak: "iq",
  irán: "ir",
  japón: "jp",
  jordania: "jo",
  marruecos: "ma",
  méxico: "mx",
  noruega: "no",
  "nueva zelanda": "nz",
  "países bajos": "nl",
  panamá: "pa",
  paraguay: "py",
  portugal: "pt",
  "república checa": "cz",
  "república democrática del congo": "cd",
  senegal: "sn",
  sudáfrica: "za",
  suecia: "se",
  suiza: "ch",
  túnez: "tn",
  turquía: "tr",
  uruguay: "uy",
  uzbekistán: "uz",
};

function Flag({ team }: { team: string }) {
  const code = countryFlags[team.toLowerCase()];
  if (!code) return <span className="text-xs">🏳️</span>;

  return (
    <img
      src={`https://flagcdn.com/24x18/${code}.png`}
      className="inline-block rounded-sm"
    />
  );
}

export default function PronosticosPage() {
  const [user, setUser] = useState<any>(null);
  const [round, setRound] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;

    if (!parsed) return;

    setUser(parsed);

    const { data: r } = await supabase
      .from("rounds")
      .select("*")
      .eq("active", true)
      .single();

    setRound(r);
    if (!r) return;

    const { data: m } = await supabase
      .from("matches")
      .select("*")
      .eq("round_id", r.id)
      .order("match_date", { ascending: true });

    setMatches(m ?? []);

    if (m?.length) {
      const first = new Date(m[0].match_date);
      if (new Date() >= first) setLocked(true);
    }

    const { data: p } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", parsed.id);

    const map: Record<number, Prediction> = {};

    (p ?? []).forEach((x) => {
      map[x.match_id] = {
        match_id: x.match_id,
        predicted_home: x.predicted_home,
        predicted_away: x.predicted_away,
      };
    });

    setPredictions(map);
  }

  function updatePrediction(
    matchId: number,
    field: "home" | "away",
    value: string
  ) {
    const num = value === "" ? null : Number(value);

    setPredictions((prev) => {
      const current = prev[matchId] ?? {
        match_id: matchId,
        predicted_home: null,
        predicted_away: null,
      };

      return {
        ...prev,
        [matchId]: {
          ...current,
          predicted_home:
            field === "home" ? num : current.predicted_home,
          predicted_away:
            field === "away" ? num : current.predicted_away,
        },
      };
    });
  }

  async function save() {
    if (locked) return;

    setLoading(true);

    for (const m of matches) {
      const p = predictions[m.id];
      if (!p) continue;

      await supabase.from("predictions").upsert({
        user_id: user.id,
        match_id: m.id,
        predicted_home: p.predicted_home ?? 0,
        predicted_away: p.predicted_away ?? 0,
      });
    }

    setLoading(false);
    alert("Guardado");
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between max-w-md mx-auto mb-4">
        <Link href="/" className="bg-gray-700 px-2 py-1 rounded text-xs">
          ← Volver
        </Link>

        <button
          onClick={save}
          disabled={loading || locked}
          className={`px-2 py-1 rounded text-xs ${
            locked ? "bg-gray-600" : "bg-green-600"
          }`}
        >
          {locked ? "Bloqueado" : loading ? "Guardando..." : "Guardar"}
        </button>
      </div>

      {/* TITLE */}
      <div className="text-center mb-4">
        <h1 className="text-sm font-semibold">
          ⚽ Pronósticos de partidos
        </h1>
      </div>

      {/* MATCHES */}
      <div className="space-y-3 max-w-md mx-auto">

        {matches.map((m) => {
          const p = predictions[m.id];

          return (
            <div key={m.id} className="bg-gray-900 p-3 rounded">

              {/* EQUIPOS + FLAGS (RESTAURADO LOOK AND FEEL) */}
              <div className="flex justify-between items-center text-xs mb-2">

                <div className="flex items-center gap-2">
                  <Flag team={m.team_home} />
                  <span>{m.team_home}</span>
                </div>

                <span className="text-gray-400">vs</span>

                <div className="flex items-center gap-2">
                  <span>{m.team_away}</span>
                  <Flag team={m.team_away} />
                </div>

              </div>

              {/* INPUTS */}
              <div className="flex items-center justify-between gap-2">

                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={locked}
                  className="w-14 bg-gray-800 text-center p-1 rounded"
                  value={p?.predicted_home ?? ""}
                  onChange={(e) =>
                    updatePrediction(m.id, "home", e.target.value)
                  }
                  onWheel={(e) => (e.target as HTMLElement).blur()}
                />

                <span className="text-xs text-gray-400">-</span>

                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={locked}
                  className="w-14 bg-gray-800 text-center p-1 rounded"
                  value={p?.predicted_away ?? ""}
                  onChange={(e) =>
                    updatePrediction(m.id, "away", e.target.value)
                  }
                  onWheel={(e) => (e.target as HTMLElement).blur()}
                />
              </div>

              {/* DATE */}
              <div className="text-[10px] text-gray-400 mt-2 text-center">
                {new Date(m.match_date).toLocaleString()}
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}