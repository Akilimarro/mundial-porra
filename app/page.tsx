"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function HomePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [round, setRound] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadActiveRound();
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
  }

  async function loadActiveRound() {
    const { data } = await supabase
      .from("rounds")
      .select("*")
      .eq("active", true)
      .single();

    setRound(data);

    if (data) {
      const res = await supabase
        .from("matches")
        .select("*")
        .eq("round_id", data.id)
        .order("match_date", { ascending: true });

      setMatches(res.data ?? []);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">⚽ Mundial Porra</h1>

        <div className="flex gap-2">
          {!user ? (
            <Link href="/login" className="bg-blue-600 px-4 py-2 rounded">
              Login
            </Link>
          ) : (
            <>
              <span className="text-sm opacity-70">
                👤 {user.email}
              </span>
              <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* RONDA ACTIVA */}
      <div className="bg-gray-900 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold">
          🏆 {round?.name ?? "Sin ronda activa"}
        </h2>
      </div>

      {/* BOTONES NUEVOS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link
          href="/pronosticos"
          className="bg-green-600 text-center py-3 rounded font-bold"
        >
          📊 Pronósticos partidos
        </Link>

        <Link
          href="/ranking"
          className="bg-yellow-600 text-center py-3 rounded font-bold"
        >
          🏅 Ranking general
        </Link>

        <Link
          href="/goleadores"
          className="bg-purple-600 text-center py-3 rounded font-bold"
        >
          ⚽ Pronóstico goleadores
        </Link>

        <Link
          href="/ranking-goleadores"
          className="bg-pink-600 text-center py-3 rounded font-bold"
        >
          🥇 Ranking goleadores
        </Link>
      </div>

      {/* PARTIDOS */}
      <div className="space-y-3">
        {matches.map((m) => (
          <div key={m.id} className="bg-gray-800 p-3 rounded">
            <div className="flex justify-between">
              <span>{m.team_home}</span>
              <span>
                {m.goals_home ?? "-"} - {m.goals_away ?? "-"}
              </span>
              <span>{m.team_away}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}