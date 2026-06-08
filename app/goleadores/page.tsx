"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function GoleadoresPage() {
  const [user, setUser] = useState<any>(null);
  const [round, setRound] = useState<any>(null);

  const [countries, setCountries] = useState<string[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([
    { country: "", player_id: "" },
    { country: "", player_id: "" },
    { country: "", player_id: "" },
  ]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const u = await supabase.auth.getUser();
    setUser(u.data.user);

    const r = await supabase
      .from("rounds")
      .select("*")
      .eq("active", true)
      .single();

    setRound(r.data);

    const p = await supabase.from("players").select("*");
    setPlayers(p.data ?? []);

    const unique = [...new Set((p.data ?? []).map((x) => x.team))];
    setCountries(unique);
  }

  function getPlayersByCountry(country: string) {
    return players.filter((p) => p.team === country);
  }

  async function save() {
    if (!user || !round) return;

    for (const s of selected) {
      if (!s.player_id) continue;

      await supabase.from("player_predictions").upsert({
        user_id: user.id,
        round_id: round.id,
        player_id: Number(s.player_id),
      });
    }

    alert("Guardado");
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <Link href="/" className="bg-gray-700 px-4 py-2 rounded">
          ← Volver
        </Link>

        <button onClick={save} className="bg-green-600 px-4 py-2 rounded">
          Guardar
        </button>
      </div>

      <h1 className="text-xl mb-4">⚽ Pronóstico de goleadores</h1>

      {/* SELECTORES */}
      <div className="space-y-4">
        {selected.map((s, i) => (
          <div key={i} className="bg-gray-900 p-3 rounded">
            {/* país */}
            <select
              className="bg-gray-800 p-2 w-full mb-2"
              value={s.country}
              onChange={(e) => {
                const copy = [...selected];
                copy[i].country = e.target.value;
                copy[i].player_id = "";
                setSelected(copy);
              }}
            >
              <option value="">Selecciona país</option>
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* jugador */}
            <select
              className="bg-gray-800 p-2 w-full"
              value={s.player_id}
              onChange={(e) => {
                const copy = [...selected];
                copy[i].player_id = e.target.value;
                setSelected(copy);
              }}
            >
              <option value="">Selecciona jugador</option>
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