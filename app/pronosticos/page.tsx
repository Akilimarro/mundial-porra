"use client"

import { useEffect } from "react"

export default function PronosticosPage() {
  useEffect(() => {
    const user = localStorage.getItem("user")

    if (!user) {
      window.location.href = "/login"
    }
  }, [])

  return (
    <div style={styles.page}>
      <h1>🎯 Pronósticos</h1>
      <p>Aquí harás tus apuestas de la fase actual</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#000",
    color: "white",
    padding: 20,
    fontFamily: "sans-serif"
  }
}