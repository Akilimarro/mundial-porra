export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: 200, padding: 20 }}>
        <h3>⚙️ Admin</h3>

        <ul>
          <li><a href="/admin">Home</a></li>
          <li><a href="/admin/matches">Partidos</a></li>
          <li><a href="/admin/rounds">Rondas</a></li>
        </ul>
      </aside>

      <main style={{ padding: 20, flex: 1 }}>
        {children}
      </main>
    </div>
  )
}