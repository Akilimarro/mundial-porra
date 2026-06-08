"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

/* ---------------- FLAGS ---------------- */

const countryMap: Record<string, string> = {
  "alemania": "de",
  "arabia saudita": "sa",
  "argelia": "dz",
  "argentina": "ar",
  "australia": "au",
  "austria": "at",
  "bélgica": "be",
  "bosnia y herzegovina": "ba",
  "brasil": "br",
  "cabo verde": "cv",
  "canadá": "ca",
  "catar": "qa",
  "colombia": "co",
  "corea del sur": "kr",
  "costa de marfil": "ci",
  "croacia": "hr",
  "curazao": "cw",
  "ecuador": "ec",
  "egipto": "eg",
  "escocia": "gb",
  "españa": "es",
  "estados unidos": "us",
  "francia": "fr",
  "ghana": "gh",
  "haití": "ht",
  "inglaterra": "gb",
  "irak": "iq",
  "irán": "ir",
  "japón": "jp",
  "jordania": "jo",
  "marruecos": "ma",
  "méxico": "mx",
  "noruega": "no",
  "nueva zelanda": "nz",
  "países bajos": "nl",
  "panamá": "pa",
  "paraguay": "py",
  "portugal": "pt",
  "república checa": "cz",
  "república democrática del congo": "cd",
  "senegal": "sn",
  "sudáfrica": "za",
  "suecia": "se",
  "suiza": "ch",
  "túnez": "tn",
  "turquía": "tr",
  "uruguay": "uy",
  "uzbekistán": "uz",
};

function getFlag(team: string) {
  const code = countryMap[team.toLowerCase()];
  if (!code) return null;
  return `https://flagcdn.com/w40/${code}.png`;
}

/* ---------------- PAGE ---------------- */

export default function HomePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [round, setRound] = useState<any>(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: u } = await supabase.auth.getUser();
    setUser(u.user);

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
      .order("match_date");

    setMatches(m ?? []);

    if (u.user) {
      const { data: p } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", u.user.id);

      const map: any = {};
      p?.forEach((x) => (map[x.match_id] = x));
      setPredictions(map);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🏆 Mundial Porra</h1>

        <div className="flex items-center gap-3 text-sm">
          {user && <span>👤 {user.email}</span>}
          {user && (
            <button
              onClick={logout}
              className="bg-red-600 px-3 py-1 rounded text-xs"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* RONDA */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold">{round?.name}</h2>
        <img
          src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/FIFA_World_Cup_2022.svg/800px-FIFA_World_Cup_2022.svg.png"
          className="h-16 mx-auto mt-2 opacity-80"
        />
      </div>

      {/* BOTONES */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 text-sm">

        <Link href="/pronosticos" className="bg-green-600 px-3 py-2 rounded">
          Pronósticos
        </Link>

        <Link href="/ranking" className="bg-yellow-600 px-3 py-2 rounded">
          Ranking
        </Link>

        <Link href="/goleadores" className="bg-purple-600 px-3 py-2 rounded">
          Goleadores
        </Link>

        <Link href="/ranking-goleadores" className="bg-pink-600 px-3 py-2 rounded">
          Ranking goles
        </Link>

      </div>

      {/* PARTIDOS */}
      <div className="space-y-3">
        {matches.map((m) => {
          const p = predictions[m.id];

          return (
            <div
              key={m.id}
              className="bg-gray-900 rounded p-3 flex items-center justify-between"
            >
              {/* HOME */}
              <div className="flex items-center gap-2 w-1/3">
                {getFlag(m.team_home) && (
                  <img src={getFlag(m.team_home)!} className="w-6 h-4" />
                )}
                <span className="text-sm">{m.team_home}</span>
              </div>

              {/* RESULT */}
              <div className="text-center w-1/3">
                <div className="text-lg font-bold">
                  {m.goals_home ?? "-"} - {m.goals_away ?? "-"}
                </div>

                <div className="text-xs text-gray-400">
                  ({p ? `${p.predicted_home}-${p.predicted_away}` : "-"})
                </div>
              </div>

              {/* AWAY */}
              <div className="flex items-center justify-end gap-2 w-1/3">
                <span className="text-sm">{m.team_away}</span>
                {getFlag(m.team_away) && (
                  <img src={getFlag(m.team_away)!} className="w-6 h-4" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}