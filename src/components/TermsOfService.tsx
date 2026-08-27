export default function TermsOfService() {
  return (
    <section className="min-h-screen pt-28 pb-16 bg-background text-foreground">
      <div className="container mx-auto px-6 max-w-xl">
        <p className="text-xs font-mono mb-3 text-muted-foreground uppercase tracking-wider">
          Effective date: June 1, 2026
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
          These Terms of Service govern your access to and use of EduScrapeApp. By using the service, you agree to these
          terms.
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Eligibility and Accounts
            </h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all activity
              that occurs under your account.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Acceptable Use
            </h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>Do not misuse the service or attempt to access it using a method other than the interface provided.</li>
              <li>Do not upload content that violates laws or the rights of others.</li>
              <li>Do not interfere with or disrupt the integrity or performance of the service.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Content Ownership
            </h2>
            <p className="text-muted-foreground">
              You retain ownership of content you submit. You grant EduScrapeApp a limited license to host and display the
              content solely to provide the service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Termination
            </h2>
            <p className="text-muted-foreground">
              We may suspend or terminate access if you violate these terms or if required to comply with legal
              obligations.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Changes to Terms
            </h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the service indicates acceptance of any
              updated terms.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <a
            href="/#"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card text-foreground hover:bg-secondary text-xs font-medium transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </section>
  );
}
