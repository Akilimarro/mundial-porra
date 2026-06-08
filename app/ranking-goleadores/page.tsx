"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RankingGoleadores() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await supabase.from("player_leaderboard").select("*");
    setData(res.data ?? []);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex mb-6">
        <Link href="/" className="bg-gray-700 px-4 py-2 rounded">
          ← Volver
        </Link>
      </div>

      <h1 className="text-xl mb-4">🥇 Ranking goleadores</h1>

      <div className="space-y-3">
        {data.map((u, i) => (
          <div key={u.user_id} className="bg-gray-900 p-3 rounded flex justify-between">
            <span>
              {i === 0 && "🥇 "}
              {i === 1 && "🥈 "}
              {i === 2 && "🥉 "}
              {u.username}
            </span>

            <span>{u.total_points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}