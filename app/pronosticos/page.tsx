"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Match = {
  id: number;
  team_home: string;
  team_away: string;
  goals_home: number | "";
  goals_away: number | "";
  match_date: string;
};

export default function PronosticosPage() {
  const [user, setUser] = useState<any>(null);
  const [round, setRound] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (!parsedUser) {
      alert("Debes hacer login");
      return;
    }

    setUser(parsedUser);

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

    // ⚠️ normalizar datos para evitar undefined/null
    const normalized =
      (m ?? []).map((x: any) => ({
        ...x,
        goals_home: x.goals_home ?? "",
        goals_away: x.goals_away ?? "",
      })) || [];

    setMatches(normalized);

    // LOCK POR FECHA
    if (m?.length) {
      const firstMatch = new Date(m[0].match_date);
      if (new Date() >= firstMatch) setLocked(true);
    }
  }

  function updateMatch(id: number, field: "home" | "away", value: string) {
    const numValue = value === "" ? "" : Number(value);

    setMatches((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              goals_home:
                field === "home" ? numValue : m.goals_home,
              goals_away:
                field === "away" ? numValue : m.goals_away,
            }
          : m
      )
    );
  }

  async function save() {
    if (locked) {
      alert("❌ Ya ha empezado la ronda");
      return;
    }

    setLoading(true);

    try {
      for (const m of matches) {
        await supabase
          .from("matches")
          .update({
            goals_home:
              m.goals_home === "" ? null : Number(m.goals_home),
            goals_away:
              m.goals_away === "" ? null : Number(m.goals_away),
          })
          .eq("id", m.id);
      }

      alert("✅ Guardado correctamente");
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }

    setLoading(false);
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

      {/* TITULO */}
      <div className="text-center mb-4">
        <h1 className="text-sm font-semibold">
          ⚽ Pronósticos de partidos
        </h1>

        {locked && (
          <div className="text-red-400 text-[11px] mt-1">
            🔒 Ronda iniciada - edición bloqueada
          </div>
        )}
      </div>

      {/* MATCHES */}
      <div className="space-y-3 max-w-md mx-auto">
        {matches.map((m) => (
          <div key={m.id} className="bg-gray-900 p-3 rounded">

            <div className="flex justify-between text-xs mb-2">
              <span>{m.team_home}</span>
              <span>{m.team_away}</span>
            </div>

            <div className="flex items-center justify-between gap-2">

              {/* HOME */}
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                disabled={locked}
                className="w-16 bg-gray-800 text-center p-1 rounded"
                value={m.goals_home}
                onChange={(e) =>
                  updateMatch(m.id, "home", e.target.value)
                }
                onWheel={(e) => (e.target as HTMLElement).blur()}
              />

              <span className="text-xs text-gray-400">-</span>

              {/* AWAY */}
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                disabled={locked}
                className="w-16 bg-gray-800 text-center p-1 rounded"
                value={m.goals_away}
                onChange={(e) =>
                  updateMatch(m.id, "away", e.target.value)
                }
                onWheel={(e) => (e.target as HTMLElement).blur()}
              />
            </div>

            {/* FECHA */}
            <div className="text-[10px] text-gray-400 mt-2 text-center">
              {new Date(m.match_date).toLocaleString()}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}