"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Match = {
  id: number;
  team_home: string;
  team_away: string;
  match_date: string;
  goals_home: number | null;
  goals_away: number | null;
};

type Prediction = {
  match_id: number;
  predicted_home: number | null;
  predicted_away: number | null;
};

/* =========================
   🌍 FLAGS (SIN TILDES)
========================= */
const countryFlags: Record<string, string> = {
  alemania: "de",
  "arabia saudita": "sa",
  argelia: "dz",
  argentina: "ar",
  australia: "au",
  austria: "at",
  belgica: "be",
  "bosnia y herzegovina": "ba",
  brasil: "br",
  "cabo verde": "cv",
  canada: "ca",
  catar: "qa",
  colombia: "co",
  "corea del sur": "kr",
  "costa de marfil": "ci",
  croacia: "hr",
  curazao: "cw",
  ecuador: "ec",
  egipto: "eg",
  escocia: "gb-sct",
  espana: "es",
  "estados unidos": "us",
  francia: "fr",
  ghana: "gh",
  haiti: "ht",
  inglaterra: "gb-eng",
  irak: "iq",
  iran: "ir",
  japon: "jp",
  jordania: "jo",
  marruecos: "ma",
  mexico: "mx",
  noruega: "no",
  "nueva zelanda": "nz",
  "paises bajos": "nl",
  panama: "pa",
  paraguay: "py",
  portugal: "pt",
  "republica checa": "cz",
  "republica democratica del congo": "cd",
  senegal: "sn",
  sudafrica: "za",
  suecia: "se",
  suiza: "ch",
  tunez: "tn",
  turquia: "tr",
  uruguay: "uy",
  uzbekistan: "uz",
};

// 🔥 NORMALIZADOR CONSISTENTE
function normalize(team: string) {
  return team
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function Flag({ team }: { team: string }) {
  const code = countryFlags[normalize(team)];
  if (!code) return <span>🏳️</span>;

  return (
    <img
      src={`https://flagcdn.com/20x15/${code}.png`}
      className="inline-block rounded-sm"
    />
  );
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<number, Prediction>>(
    {}
  );

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    init();
  }, []);

  async function init() {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;

    if (parsed) setUser(parsed);

    const { data: round } = await supabase
      .from("rounds")
      .select("*")
      .eq("active", true)
      .single();

    if (!round) return;

    const { data: m } = await supabase
      .from("matches")
      .select("*")
      .eq("round_id", round.id)
      .order("match_date", { ascending: true });

    setMatches(m ?? []);

    if (parsed) {
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

      setPredictions((prev) => ({ ...map, ...prev }));
    }
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  }

  function renderPrediction(matchId: number) {
    const p = predictions[matchId];
    return p
      ? `${p.predicted_home ?? "-"} | ${p.predicted_away ?? "-"}`
      : "- | -";
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      {/* HEADER */}
      <div className="max-w-md mx-auto mb-4">

        <div className="flex justify-between text-xs mb-2">
          <div>{user ? `👤 ${user.username}` : "No logueado"}</div>

          {!user ? (
            <Link
              href="/login"
              className="bg-gray-700 px-2 py-1 rounded"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={logout}
              className="bg-red-700 px-2 py-1 rounded"
            >
              Logout
            </button>
          )}
        </div>

        {user && (
          <div className="flex flex-wrap gap-2 justify-center text-xs">

            <Link href="/pronosticos" className="bg-gray-700 px-2 py-1 rounded">
              Pronósticos
            </Link>

            <Link href="/ranking" className="bg-gray-700 px-2 py-1 rounded">
              Ranking
            </Link>

            <Link href="/instrucciones" className="bg-gray-700 px-2 py-1 rounded">
              Instrucciones
            </Link>

          </div>
        )}
      </div>

      {/* PARTIDOS */}
      <div className="space-y-3 max-w-md mx-auto">

        {matches.map((m) => (
          <div key={m.id} className="bg-gray-900 p-3 rounded">

            <div className="flex justify-between items-center text-xs mb-1">

              <div className="flex items-center gap-2">
                <Flag team={m.team_home} />
                {m.team_home}
              </div>

              <div className="text-gray-400">vs</div>

              <div className="flex items-center gap-2">
                {m.team_away}
                <Flag team={m.team_away} />
              </div>

            </div>

            <div className="text-center text-sm text-gray-300">
              {m.goals_home ?? "-"} / {m.goals_away ?? "-"}
            </div>

            <div className="text-center text-xs text-green-400 mt-1">
              {renderPrediction(m.id)}
            </div>

            <div className="text-[10px] text-gray-500 text-center mt-1">
              {new Date(m.match_date).toLocaleString()}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}