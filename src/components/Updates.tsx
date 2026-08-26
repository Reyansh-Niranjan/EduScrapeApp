export default function Updates() {
  const placeholders = Array.from({ length: 2 });

  return (
    <section id="updates" className="py-20 relative border-b border-border bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-foreground">
            Platform Changelog & Releases
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Live synchronization with GitHub Releases and deployment notes.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {placeholders.map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-6 transition-all"
            >
              <div className="h-1 w-12 rounded-full bg-emerald-500 mb-5" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary border border-border" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-1/3 rounded bg-secondary" />
                  <div className="h-3.5 w-2/3 rounded bg-secondary/60" />
                  <div className="h-3.5 w-full rounded bg-secondary/40" />
                  <div className="h-3 w-1/4 rounded bg-secondary/60 pt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
