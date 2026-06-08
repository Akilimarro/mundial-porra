"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type UserPoints = {
  user_id: number;
  username: string;
  points: number;
};

export default function RankingGoleadoresPage() {
  const [user, setUser] = useState<any>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<any>(null);
  const [ranking, setRanking] = useState<UserPoints[]>([]);
  const [loading, setLoading] = useState(false);

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
      .order("id", { ascending: true });

    setRounds(r ?? []);

    const active = r?.find((x) => x.active);
    setSelectedRound(active || r?.[0] || null);

    if (active || r?.[0]) {
      loadRanking(active?.id || r?.[0].id);
    }
  }

  async function loadRanking(roundId: number) {
    setLoading(true);

    /**
     * 1. goles por jugador en la ronda
     * 2. predicciones de jugadores por usuario
     * 3. sumar goles reales de jugadores elegidos
     */

    const { data: goals } = await supabase
      .from("player_goals")
      .select("*")
      .eq("round_id", roundId);

    const goalsMap: Record<number, number> = {};
    (goals ?? []).forEach((g) => {
      goalsMap[g.player_id] = g.goals || 0;
    });

    const { data: preds } = await supabase
      .from("player_predictions")
      .select("user_id, player_id")
      .eq("round_id", roundId);

    const { data: users } = await supabase.from("users").select("*");

    const userMap: Record<number, string> = {};
    (users ?? []).forEach((u) => {
      userMap[u.id] = u.username;
    });

    const pointsMap: Record<number, number> = {};

    (preds ?? []).forEach((p) => {
      const goalsForPlayer = goalsMap[p.player_id] || 0;

      if (!pointsMap[p.user_id]) pointsMap[p.user_id] = 0;

      pointsMap[p.user_id] += goalsForPlayer;
    });

    const result: UserPoints[] = Object.entries(pointsMap).map(
      ([uid, pts]) => ({
        user_id: Number(uid),
        username: userMap[Number(uid)] || "Desconocido",
        points: pts,
      })
    );

    result.sort((a, b) => b.points - a.points);

    setRanking(result);
    setLoading(false);
  }

  function getMedal(index: number, points: number, list: UserPoints[]) {
    const sorted = [...list].sort((a, b) => b.points - a.points);

    const position = sorted.findIndex((u) => u.points === points);

    if (position === 0) return "🥇";
    if (position === 1) return "🥈";
    if (position === 2) return "🥉";
    return "";
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between max-w-md mx-auto mb-4">
        <Link href="/" className="bg-gray-700 px-2 py-1 rounded text-xs">
          ← Volver
        </Link>

        <select
          className="bg-gray-800 text-xs p-1 rounded"
          value={selectedRound?.id || ""}
          onChange={(e) => {
            const r = rounds.find((x) => x.id === Number(e.target.value));
            setSelectedRound(r);
            if (r) loadRanking(r.id);
          }}
        >
          {rounds.map((r) => (
            <option key={r.id} value={r.id}>
              Fase {r.id} {r.active ? "(Activa)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* TITLE */}
      <div className="text-center mb-4">
        <h1 className="text-sm font-semibold">
          ⚽ Ranking goleadores
        </h1>
      </div>

      {/* LIST */}
      <div className="space-y-2 max-w-md mx-auto">

        {loading && (
          <div className="text-center text-xs text-gray-400">
            Cargando...
          </div>
        )}

        {!loading &&
          ranking.map((u, i) => (
            <div
              key={u.user_id}
              className="bg-gray-900 p-3 rounded flex justify-between items-center"
            >

              <div className="flex items-center gap-2">

                <span className="text-lg">
                  {getMedal(i, u.points, ranking)}
                </span>

                <span className="text-xs">
                  {u.username}
                </span>

              </div>

              <span className="text-xs font-bold">
                {u.points} pts
              </span>

            </div>
          ))}

        {!loading && ranking.length === 0 && (
          <div className="text-center text-xs text-gray-400">
            Sin datos aún
          </div>
        )}
      </div>
    </div>
  );
}