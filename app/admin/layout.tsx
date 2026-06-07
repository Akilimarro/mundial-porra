export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
        width: 220,
        padding: 20,
        borderRight: "1px solid #ddd"
      }}>
        <h2>⚙️ Admin</h2>

        <nav>
          <ul>
            <li><a href="/admin">Dashboard</a></li>
            <li><a href="/admin/matches">Partidos</a></li>
          </ul>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        {children}
      </main>
    </div>
  )
}