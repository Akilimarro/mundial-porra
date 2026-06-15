"use client";

import Link from "next/link";

export default function InstruccionesPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between max-w-md mx-auto mb-6">
        <Link href="/" className="bg-gray-700 px-2 py-1 rounded text-xs">
          ← Volver
        </Link>
      </div>

      {/* TÍTULO */}
      <div className="text-center mb-6 max-w-md mx-auto">
        <h1 className="text-lg font-semibold">📖 Instrucciones</h1>
        <p className="text-xs text-gray-400 mt-1">
          Cómo funciona la porra del Mundial
        </p>
      </div>

      {/* CONTENIDO */}
      <div className="space-y-4 max-w-md mx-auto text-xs">

        {/* GENERAL */}
        <div className="bg-gray-900 p-3 rounded">
          <h2 className="font-semibold mb-2">🏆 Objetivo</h2>
          <p className="text-gray-300">
            Compite contra otros usuarios acertando resultados de partidos y
            eligiendo goleadores. Cuantos más puntos consigas, mejor posición
            tendrás en el ranking.
          </p>
        </div>

        {/* PARTIDOS */}
        <div className="bg-gray-900 p-3 rounded">
          <h2 className="font-semibold mb-2">⚽ Pronósticos de partidos</h2>

          <ul className="space-y-1 text-gray-300">
            <li>• Solo puedes pronosticar la ronda activa</li>
            <li>• Introduce el resultado de cada partido</li>
            <li>• Puedes modificarlo hasta que empiece el partido</li>
            <li>• 30 minutos antes del inicio se bloquea</li>
          </ul>
        </div>

        {/* PUNTOS */}
        <div className="bg-gray-900 p-3 rounded">
          <h2 className="font-semibold mb-2">🎯 Puntuación partidos</h2>

          <ul className="space-y-1 text-gray-300">
            <li>• Resultado exacto → máxima puntuación (2)</li>
            <li>• Acierto de ganador/empate → puntuación parcial (1)</li>
            <li>• Fallo → 0 puntos</li>
          </ul>
        </div>

        {/* RANKING */}
        <div className="bg-gray-900 p-3 rounded">
          <h2 className="font-semibold mb-2">🥇 Ranking</h2>

          <ul className="space-y-1 text-gray-300">
            <li>• Solo participan usuarios activos</li>
            <li>• Se suman puntos de partidos</li>
            <li>• Empates comparten posición</li>
          </ul>
        </div>

        {/* CONSEJOS */}
        <div className="bg-gray-900 p-3 rounded">
          <h2 className="font-semibold mb-2">💡 Consejos</h2>

          <ul className="space-y-1 text-gray-300">
            <li>• No olvides guardar tus pronósticos</li>
            <li>• Revisa fechas de partidos</li>
          </ul>
        </div>

      </div>
    </div>
  );
}