interface DashboardProps {
  onLogout?: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const placeholders = Array.from({ length: 4 });

  return (
    <section className="min-h-screen" style={{ background: "var(--theme-bg)" }}>
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--theme-text)" }}>
              Dashboard
            </h1>
            <p className="mt-2" style={{ color: "var(--theme-text-secondary)" }}>
              Content will appear once live data is connected.
            </p>
          </div>
          {onLogout ? (
            <button className="btn-outline px-5 py-2.5" onClick={onLogout}>
              Log out
            </button>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((_, index) => (
            <div
              key={index}
              className="rounded-2xl p-6"
              style={{ background: "var(--theme-card-bg)", border: "1px solid var(--theme-border)" }}
            >
              <div className="h-4 w-1/3 rounded mb-4" style={{ background: "var(--theme-border)" }} />
              <div className="h-4 w-3/4 rounded mb-2" style={{ background: "var(--theme-bg-secondary)" }} />
              <div className="h-4 w-full rounded mb-4" style={{ background: "var(--theme-bg-secondary)" }} />
              <div className="h-32 rounded" style={{ background: "var(--theme-bg-secondary)" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
