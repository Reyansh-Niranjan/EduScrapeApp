export default function Updates() {
  const placeholders = Array.from({ length: 2 });

  return (
    <section id="updates" className="py-20 relative" style={{ background: "var(--theme-bg)" }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--theme-text)" }}>
            Latest <span className="bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">Updates</span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--theme-text-secondary)" }}>
            Updates will appear once release data is connected.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {placeholders.map((_, index) => (
            <div
              key={index}
              className="group card rounded-2xl transition-all duration-300"
              style={{ background: "var(--theme-card-bg)", border: "1px solid var(--theme-border)" }}
            >
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-teal-400 to-purple-500 mb-6" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full" style={{ background: "var(--theme-bg-secondary)" }} />
                <div className="flex-1">
                  <div className="h-4 w-1/3 rounded mb-3" style={{ background: "var(--theme-border)" }} />
                  <div className="h-4 w-2/3 rounded mb-2" style={{ background: "var(--theme-bg-secondary)" }} />
                  <div className="h-4 w-full rounded mb-4" style={{ background: "var(--theme-bg-secondary)" }} />
                  <div className="h-3 w-1/4 rounded" style={{ background: "var(--theme-border)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
