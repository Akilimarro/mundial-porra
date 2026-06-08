"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

/* FLAGS */

const countryMap: Record<string, string> = {
  "alemania": "de",
  "arabia saudita": "sa",
  "argentina": "ar",
  "brasil": "br",
  "españa": "es",
  "francia": "fr",
  "inglaterra": "gb",
  "méxico": "mx",
  "portugal": "pt",
  "uruguay": "uy",
  "estados unidos": "us",
  "alemania": "de",
};

function getFlag(team: string) {
  const code = countryMap[team.toLowerCase()];
  return code ? `https://flagcdn.com/w40/${code}.png` : null;
}

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
      <div className="flex justify-between items-center mb-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold">🏆 Mundial</h1>

        <div className="flex items-center gap-2 text-xs">
          {user && <span>👤 {user.email}</span>}
          {user && (
            <button
              onClick={logout}
              className="bg-red-600 px-2 py-1 rounded"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* RONDA */}
      <div className="text-center mb-6">
        <h2 className="text-sm">{round?.name}</h2>
      </div>

      {/* BOTONES */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs">
        <Link href="/pronosticos" className="bg-green-600 px-2 py-1 rounded">
          Pronósticos
        </Link>

        <Link href="/ranking" className="bg-yellow-600 px-2 py-1 rounded">
          Ranking
        </Link>

        <Link href="/goleadores" className="bg-purple-600 px-2 py-1 rounded">
          Goleadores
        </Link>

        <Link href="/ranking-goleadores" className="bg-pink-600 px-2 py-1 rounded">
          Ranking goles
        </Link>
      </div>

      {/* PARTIDOS */}
      <div className="space-y-2 max-w-md mx-auto">
        {matches.map((m) => {
          const p = predictions[m.id];

          return (
            <div
              key={m.id}
              className="bg-gray-900 rounded px-3 py-2 flex items-center justify-between"
            >
              {/* HOME */}
              <div className="flex items-center gap-1 w-[35%]">
                {getFlag(m.team_home) && (
                  <img src={getFlag(m.team_home)!} className="w-5 h-3" />
                )}
                <span className="text-xs truncate">{m.team_home}</span>
              </div>

              {/* RESULT */}
              <div className="text-center w-[30%]">
                <div className="text-sm font-bold">
                  {m.goals_home ?? "-"} / {m.goals_away ?? "-"}
                </div>

                <div className="text-[10px] text-gray-400">
                  ({p ? `${p.predicted_home}-${p.predicted_away}` : "-"})
                </div>
              </div>

              {/* AWAY */}
              <div className="flex items-center justify-end gap-1 w-[35%]">
                <span className="text-xs truncate">{m.team_away}</span>
                {getFlag(m.team_away) && (
                  <img src={getFlag(m.team_away)!} className="w-5 h-3" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}