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

// FLAGS (igual que antes)
const countryFlags: Record<string, string> = {
  españa: "es",
  francia: "fr",
  alemania: "de",
  brasil: "br",
  argentina: "ar",
  inglaterra: "gb-eng",
  "estados unidos": "us",
  méxico: "mx",
  portugal: "pt",
  italia: "it",
  marruecos: "ma",
  japón: "jp",
  "corea del sur": "kr",
};

function Flag({ team }: { team: string }) {
  const code = countryFlags[team.toLowerCase()];
  if (!code) return <span>🏳️</span>;

  return (
    <img
      src={`https://flagcdn.com/20x15/${code}.png`}
      className="inline-block"
    />
  );
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [round, setRound] = useState<any>(null);
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

    // ronda activa
    const { data: r } = await supabase
      .from("rounds")
      .select("*")
      .eq("active", true)
      .single();

    setRound(r);
    if (!r) return;

    // partidos
    const { data: m } = await supabase
      .from("matches")
      .select("*")
      .eq("round_id", r.id)
      .order("match_date", { ascending: true });

    setMatches(m ?? []);

    if (parsed) {
      const { data: p } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", parsed.id);

      // 🔥 FIX CRÍTICO: no sobrescribir si vacío
      const map: Record<number, Prediction> = {};

      (p ?? []).forEach((x) => {
        map[x.match_id] = {
          match_id: x.match_id,
          predicted_home: x.predicted_home,
          predicted_away: x.predicted_away,
        };
      });

      setPredictions((prev) => {
        // merge seguro (NO borrar lo existente si p viene vacío)
        const merged = { ...prev, ...map };
        return Object.keys(merged).length ? merged : prev;
      });
    }
  }

  function renderPrediction(matchId: number) {
    const p = predictions[matchId];
    if (!p) return "- | -";

    return `${p.predicted_home ?? "-"} | ${p.predicted_away ?? "-"}`;
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      {/* USER */}
      <div className="flex justify-between max-w-md mx-auto mb-4 text-xs">
        <div>{user ? `👤 ${user.username}` : "No logueado"}</div>

        <div className="flex gap-2">
          <Link href="/login" className="bg-gray-700 px-2 py-1 rounded">
            Login
          </Link>
        </div>
      </div>

      {/* MATCHES */}
      <div className="space-y-3 max-w-md mx-auto">

        {matches.map((m) => (
          <div key={m.id} className="bg-gray-900 p-3 rounded">

            {/* TEAMS + FLAGS */}
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

            {/* RESULT */}
            <div className="text-center text-sm text-gray-300">
              {m.goals_home ?? "-"} / {m.goals_away ?? "-"}
            </div>

            {/* PREDICTION (FIXED) */}
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