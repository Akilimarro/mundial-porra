"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function GoleadoresPage() {
  const [user, setUser] = useState<any>(null);
  const [round, setRound] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  const [selected, setSelected] = useState([
    { country: "", player_id: "" },
    { country: "", player_id: "" },
    { country: "", player_id: "" },
  ]);

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

    const { data: p } = await supabase.from("players").select("*");

    // 🔥 FIX REAL: deduplicar por nombre + equipo
    const unique = Array.from(
      new Map((p ?? []).map((x) => [`${x.name}-${x.team}`, x])).values()
    );

    setPlayers(unique);

    const uniqueCountries = Array.from(
      new Set(unique.map((x) => x.team))
    );

    setCountries(uniqueCountries);
  }

  function getPlayersByCountry(country: string) {
    const filtered = players.filter((p) => p.team === country);

    // evitar duplicados extra por seguridad
    return Array.from(
      new Map(filtered.map((x) => [x.id, x])).values()
    );
  }

  async function save() {
    if (!user || !round) return;

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

    alert("Guardado");
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      <div className="flex justify-between max-w-md mx-auto mb-6">
        <Link href="/" className="bg-gray-700 px-2 py-1 rounded text-xs">
          ← Volver
        </Link>

        <button
          onClick={save}
          className="bg-green-600 px-2 py-1 rounded text-xs"
        >
          Guardar
        </button>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        {selected.map((s, i) => (
          <div key={i} className="bg-gray-900 p-3 rounded">

            <select
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
              className="w-full bg-gray-800 p-2 text-xs"
              value={s.player_id}
              onChange={(e) => {
                const copy = [...selected];

                // evitar elegir mismo jugador 2 veces
                if (selected.some(x => x.player_id === e.target.value)) {
                  alert("Jugador ya seleccionado");
                  return;
                }

                copy[i].player_id = e.target.value;
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

          </div>
        ))}
      </div>
    </div>
  );
}