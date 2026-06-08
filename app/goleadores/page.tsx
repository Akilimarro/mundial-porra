"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function GoleadoresPage() {
  const [user, setUser] = useState<any>(null);
  const [round, setRound] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [goalsMap, setGoalsMap] = useState<any>({});
  const [playerById, setPlayerById] = useState<Record<number, any>>({});
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);

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

    // 🔒 BLOQUEO
    const { data: matches } = await supabase
      .from("matches")
      .select("match_date")
      .eq("round_id", r.id)
      .order("match_date", { ascending: true });

    if (matches?.length) {
      const first = new Date(matches[0].match_date);
      if (new Date() >= first) setLocked(true);
    }

    // 👥 PLAYERS
    const { data: p } = await supabase.from("players").select("*");

    const uniquePlayers = Array.from(
      new Map(
        (p ?? []).map((x) => [`${x.name}-${x.team}`.toLowerCase(), x])
      ).values()
    );

    setPlayers(uniquePlayers);

    // 🔥 MAPA POR ID (CLAVE DEL FIX)
    const byId: Record<number, any> = {};
    uniquePlayers.forEach((p) => {
      byId[p.id] = p;
    });
    setPlayerById(byId);

    const uniqueCountries = Array.from(
      new Set(uniquePlayers.map((x) => x.team))
    );
    setCountries(uniqueCountries);

    // ⚽ GOLES
    const { data: goals } = await supabase
      .from("player_goals")
      .select("*")
      .eq("round_id", r.id);

    const gMap: any = {};
    goals?.forEach((g) => {
      gMap[g.player_id] = g.goals;
    });

    setGoalsMap(gMap);

    // 📥 PREDICCIONES
    const { data: existing } = await supabase
      .from("player_predictions")
      .select("*")
      .eq("user_id", parsedUser.id)
      .eq("round_id", r.id);

    let initial = [
      { country: "", player_id: "" },
      { country: "", player_id: "" },
      { country: "", player_id: "" },
    ];

    if (existing?.length) {
      const filled = existing.map((e) => {
        const pid = Number(e.player_id);
        const player = byId[pid];

        return {
          country: player?.team || "",
          player_id: pid ? String(pid) : "",
        };
      });

      while (filled.length < 3) {
        filled.push({ country: "", player_id: "" });
      }

      initial = filled.slice(0, 3);
    }

    setSelected(initial);
  }

  function getPlayersByCountry(country: string) {
    return players.filter((p) => p.team === country);
  }

  async function save() {
    if (locked) {
      alert("❌ Ronda comenzada");
      return;
    }

    setLoading(true);

    try {
      await supabase
        .from("player_predictions")
        .delete()
        .eq("user_id", user.id)
        .eq("round_id", round.id);

      for (const s of selected) {
        if (!s.player_id) continue;

        await supabase.from("player_predictions").insert({
          user_id: user.id,
          round_id: round.id,
          player_id: Number(s.player_id),
        });
      }

      alert("✅ Guardado");
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between max-w-md mx-auto mb-6">
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
          ⚽ Pronóstico de goleadores
        </h1>

        {locked && (
          <div className="text-red-400 text-[11px] mt-1">
            🔒 Ronda comenzada
          </div>
        )}
      </div>

      {/* SELECTORES */}
      <div className="space-y-3 max-w-md mx-auto">
        {selected.map((s, i) => {
          const goals = goalsMap[s.player_id] ?? 0;

          return (
            <div key={i} className="bg-gray-900 p-3 rounded">

              <select
                disabled={locked}
                className="w-full bg-gray-800 p-2 mb-2 text-xs"
                value={s.country}
                onChange={(e) => {
                  const copy = [...selected];
                  copy[i].country = e.target.value;
                  copy[i].player_id = "";
                  setSelected(copy);
                }}
              >
                <option value="">País</option>
                {countries.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <select
                disabled={locked}
                className="w-full bg-gray-800 p-2 text-xs"
                value={s.player_id}
                onChange={(e) => {
                  const val = e.target.value;

                  if (selected.some((x) => x.player_id === val)) {
                    alert("Jugador ya seleccionado");
                    return;
                  }

                  const copy = [...selected];
                  copy[i].player_id = val;
                  setSelected(copy);
                }}
              >
                <option value="">Jugador</option>
                {getPlayersByCountry(s.country).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {s.player_id && (
                <div className="text-right text-[11px] text-green-400 mt-1">
                  ⚽ {goals} goles
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}