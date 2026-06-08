"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Player = {
  id: number;
  name: string;
  team: string;
};

type Selection = {
  country: string;
  player_id: string; // mantenemos string para UI estable
};

export default function GoleadoresPage() {
  const [user, setUser] = useState<any>(null);
  const [round, setRound] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selected, setSelected] = useState<Selection[]>([
    { country: "", player_id: "" },
    { country: "", player_id: "" },
    { country: "", player_id: "" },
  ]);
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

    const { data: p } = await supabase.from("players").select("*");

    const uniquePlayers = Array.from(
      new Map(
        (p ?? []).map((x: Player) => [`${x.name}-${x.team}`, x])
      ).values()
    );

    setPlayers(uniquePlayers);

    setCountries([...new Set(uniquePlayers.map((p) => p.team))]);

    // cargar predicciones existentes
    const { data: existing } = await supabase
      .from("player_predictions")
      .select("*")
      .eq("user_id", parsed.id)
      .eq("round_id", r.id);

    if (existing?.length) {
      const filled = existing.map((e: any) => ({
        country:
          uniquePlayers.find((p) => p.id === e.player_id)?.team || "",
        player_id: String(e.player_id), // 👈 IMPORTANTE: string limpio
      }));

      setSelected(
        [...filled, ...Array(3 - filled.length).fill({ country: "", player_id: "" })].slice(0, 3)
      );
    }

    // lock por fecha
    const { data: matches } = await supabase
      .from("matches")
      .select("match_date")
      .eq("round_id", r.id)
      .order("match_date", { ascending: true });

    if (matches?.length) {
      const first = new Date(matches[0].match_date);
      if (new Date() >= first) setLocked(true);
    }
  }

  function getPlayersByCountry(country: string) {
    return players.filter((p) => p.team === country);
  }

  function updateSelection(
    index: number,
    field: "country" | "player_id",
    value: string
  ) {
    setSelected((prev) => {
      const copy = [...prev];

      if (field === "country") {
        copy[index] = {
          country: value,
          player_id: "",
        };
      } else {
        copy[index] = {
          ...copy[index],
          player_id: value,
        };
      }

      return copy;
    });
  }

  async function save() {
    if (locked || !user || !round) return;

    setLoading(true);

    await supabase
      .from("player_predictions")
      .delete()
      .eq("user_id", user.id)
      .eq("round_id", round.id);

    for (const s of selected) {
      if (!s.player_id) continue;

      // 🔥 FIX CRÍTICO: sanitización total del ID
      const playerId = Number(String(s.player_id).replace(/[^\d]/g, ""));

      if (!playerId) continue;

      await supabase.from("player_predictions").insert({
        user_id: user.id,
        round_id: round.id,
        player_id: playerId, // 👈 SIEMPRE LIMPIO
      });
    }

    setLoading(false);
    alert("Guardado correctamente");
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      {/* HEADER (LOOK & FEEL ORIGINAL) */}
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
          ⚽ Pronóstico goleadores
        </h1>
      </div>

      {/* SELECTORES */}
      <div className="space-y-3 max-w-md mx-auto">

        {selected.map((s, i) => (
          <div key={i} className="bg-gray-900 p-3 rounded">

            <select
              disabled={locked}
              className="w-full bg-gray-800 p-2 mb-2 text-xs"
              value={s.country}
              onChange={(e) =>
                updateSelection(i, "country", e.target.value)
              }
            >
              <option value="">País</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              disabled={locked || !s.country}
              className="w-full bg-gray-800 p-2 text-xs"
              value={s.player_id}
              onChange={(e) =>
                updateSelection(i, "player_id", e.target.value)
              }
            >
              <option value="">Jugador</option>
              {getPlayersByCountry(s.country).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

          </div>
        ))}

      </div>
    </div>
  );
}