"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const login = async () => {
    setError("")

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single()

    if (error || !data) {
      setError("Usuario o contraseña incorrectos")
      return
    }

    localStorage.setItem("user", JSON.stringify(data))

    // 🔥 IMPORTANTE: navegación correcta en Next
    router.replace("/")
  }

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h2>🔐 Login</h2>

        <input
          placeholder="Usuario"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Entrar</button>

        {error && <p style={{ color: "red" }}>{error}</p>}
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
    color: "white"
  },
  box: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: 260,
    padding: 20,
    border: "1px solid #333",
    borderRadius: 10
  }
}