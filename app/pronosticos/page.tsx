"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Player = {
  id: number;
  name: string;
  team: string;
};

export default function GoleadoresPage() {
  const [user, setUser] = useState<any>(null);
  const [round, setRound] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
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

    const { data: p } = await supabase
      .from("players")
      .select("*")
      .order("name");

    setPlayers(p ?? []);

    const { data: preds } = await supabase
      .from("player_predictions")
      .select("*")
      .eq("user_id", parsed.id)
      .eq("round_id", r.id);

    const map: Record<number, number> = {};

    (preds ?? []).forEach((x) => {
      map[x.round_id] = x.player_id;
    });

    setSelected(map);

    if (r) {
      const nowLocked = new Date() >= new Date(r.lock_date ?? r.created_at);
      setLocked(nowLocked);
    }
  }

  function updateSelection(roundId: number, playerId: number) {
    setSelected((prev) => ({
      ...prev,
      [roundId]: playerId,
    }));
  }

  async function save() {
    if (locked || !user || !round) return;

    setLoading(true);

    const playerId = selected[round.id];

    if (!playerId) {
      setLoading(false);
      alert("Selecciona un jugador");
      return;
    }

    // 🔥 IMPORTANTE: aquí se manda SIEMPRE players.id
    await supabase.from("player_predictions").upsert({
      user_id: user.id,
      round_id: round.id,
      player_id: playerId, // <-- FIX REAL
      points: 0,
    });

    setLoading(false);
    alert("Guardado");
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

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

      <div className="text-center mb-4">
        <h1 className="text-sm font-semibold">
          ⚽ Selección de goleadores
        </h1>
      </div>

      <div className="max-w-md mx-auto bg-gray-900 p-3 rounded">

        <select
          className="w-full bg-gray-800 p-2 rounded text-white"
          value={selected[round?.id] ?? ""}
          onChange={(e) =>
            updateSelection(round.id, Number(e.target.value)) // 🔥 FIX CLAVE
          }
          disabled={locked}
        >
          <option value="">Selecciona jugador</option>

          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.team})
            </option>
          ))}
        </select>

      </div>
    </div>
  );
}