"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

/* -------- FLAGS -------- */

const countryMap: Record<string, string> = {
  "alemania": "de",
  "arabia saudita": "sa",
  "argelia": "dz",
  "argentina": "ar",
  "australia": "au",
  "austria": "at",
  "bélgica": "be",
  "bosnia y herzegovina": "ba",
  "brasil": "br",
  "cabo verde": "cv",
  "canadá": "ca",
  "catar": "qa",
  "colombia": "co",
  "corea del sur": "kr",
  "costa de marfil": "ci",
  "croacia": "hr",
  "curazao": "cw",
  "ecuador": "ec",
  "egipto": "eg",
  "escocia": "gb",
  "españa": "es",
  "estados unidos": "us",
  "francia": "fr",
  "ghana": "gh",
  "haití": "ht",
  "inglaterra": "gb",
  "irak": "iq",
  "irán": "ir",
  "japón": "jp",
  "jordania": "jo",
  "marruecos": "ma",
  "méxico": "mx",
  "noruega": "no",
  "nueva zelanda": "nz",
  "países bajos": "nl",
  "panamá": "pa",
  "paraguay": "py",
  "portugal": "pt",
  "república checa": "cz",
  "república democrática del congo": "cd",
  "senegal": "sn",
  "sudáfrica": "za",
  "suecia": "se",
  "suiza": "ch",
  "túnez": "tn",
  "turquía": "tr",
  "uruguay": "uy",
  "uzbekistán": "uz",
};

function getFlag(team: string) {
  const code = countryMap[team.toLowerCase()];
  if (!code) return null;
  return `https://flagcdn.com/w40/${code}.png`;
}

/* -------- PAGE -------- */

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

    // 🔥 eliminar duplicados por id
    const uniquePlayers = Array.from(
      new Map((p ?? []).map((x) => [x.id, x])).values()
    );

    setPlayers(uniquePlayers);

    const uniqueCountries = Array.from(
      new Set(uniquePlayers.map((x) => x.team))
    );

    setCountries(uniqueCountries);
  }

  function getPlayersByCountry(country: string) {
    return players.filter((p) => p.team === country);
  }

  async function save() {
    if (!user || !round) return;

    // borrar anteriores de esa ronda
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

    alert("Guardado correctamente");
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <Link href="/" className="bg-gray-700 px-3 py-1 rounded text-sm">
          ← Volver
        </Link>

        <button
          onClick={save}
          className="bg-green-600 px-3 py-1 rounded text-sm"
        >
          Guardar
        </button>
      </div>

      {/* TITULO */}
      <div className="text-center mb-6">
        <h1 className="text-lg font-semibold">⚽ Pronóstico de goleadores</h1>
        <p className="text-sm text-gray-400">
          Elige 3 jugadores para esta ronda
        </p>
      </div>

      {/* SELECTORES */}
      <div className="space-y-4 max-w-md mx-auto">
        {selected.map((s, i) => (
          <div key={i} className="bg-gray-900 p-4 rounded">

            {/* PAÍS */}
            <div className="mb-2">
              <select
                className="w-full bg-gray-800 p-2 rounded text-sm"
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
            </div>

            {/* JUGADOR */}
            <div>
              <select
                className="w-full bg-gray-800 p-2 rounded text-sm"
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

          </div>
        ))}
      </div>
    </div>
  );
}