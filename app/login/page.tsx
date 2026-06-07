"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setError("")
    setLoading(true)

    try {
      // 🧼 limpiar inputs (MUY IMPORTANTE)
      const cleanUser = username.trim()
      const cleanPass = password.trim()

      if (!cleanUser || !cleanPass) {
        setError("Introduce usuario y contraseña")
        setLoading(false)
        return
      }

      // 🔍 SOLO buscamos por username primero (más robusto)
      const { data, error: supabaseError } = await supabase
        .from("users")
        .select("*")
        .eq("username", cleanUser)

      console.log("DEBUG USERS RESULT:", data, supabaseError)

      if (supabaseError) {
        setError("Error de conexión con la base de datos")
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setError("El usuario no existe")
        setLoading(false)
        return
      }

      const user = data[0]

      // 🔐 comprobar password en frontend (más claro y debuggeable)
      if (user.password !== cleanPass) {
        setError("Contraseña incorrecta")
        setLoading(false)
        return
      }

      // 💾 guardar sesión simple
      localStorage.setItem("user", JSON.stringify(user))

      // 🚀 redirigir
      router.replace("/")

    } catch (err) {
      console.error(err)
      setError("Error inesperado")
    }

    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h2>🔐 Acceso Mundial Porra</h2>

        <input
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={login} style={styles.button} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#000",
    color: "white",
    fontFamily: "sans-serif"
  },
  box: {
    width: 300,
    padding: 20,
    border: "1px solid #333",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)"
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #444",
    background: "#111",
    color: "white"
  },
  button: {
    padding: 10,
    borderRadius: 6,
    border: "none",
    background: "#1f6feb",
    color: "white",
    cursor: "pointer"
  },
  error: {
    color: "#ff4d4d",
    fontSize: 14
  }
}