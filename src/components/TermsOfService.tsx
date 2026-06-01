export default function TermsOfService() {
  return (
    <section className="min-h-screen pt-28 pb-16" style={{ background: "var(--theme-bg)" }}>
      <div className="container mx-auto px-6 max-w-4xl">
        <p className="text-sm mb-3" style={{ color: "var(--theme-text-secondary)" }}>
          Effective date: June 1, 2026
        </p>
        <h1 className="text-4xl font-bold mb-6" style={{ color: "var(--theme-text)" }}>
          Terms of Service
        </h1>
        <p className="mb-8" style={{ color: "var(--theme-text-secondary)" }}>
          These Terms of Service govern your access to and use of EduScrapeApp. By using the service, you agree to these
          terms.
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--theme-text)" }}>
              Eligibility and Accounts
            </h2>
            <p style={{ color: "var(--theme-text-secondary)" }}>
              You are responsible for maintaining the confidentiality of your account credentials and for all activity
              that occurs under your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--theme-text)" }}>
              Acceptable Use
            </h2>
            <ul className="space-y-2" style={{ color: "var(--theme-text-secondary)" }}>
              <li>Do not misuse the service or attempt to access it using a method other than the interface provided.</li>
              <li>Do not upload content that violates laws or the rights of others.</li>
              <li>Do not interfere with or disrupt the integrity or performance of the service.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--theme-text)" }}>
              Content Ownership
            </h2>
            <p style={{ color: "var(--theme-text-secondary)" }}>
              You retain ownership of content you submit. You grant EduScrapeApp a limited license to host and display the
              content solely to provide the service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--theme-text)" }}>
              Termination
            </h2>
            <p style={{ color: "var(--theme-text-secondary)" }}>
              We may suspend or terminate access if you violate these terms or if required to comply with legal
              obligations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--theme-text)" }}>
              Changes to Terms
            </h2>
            <p style={{ color: "var(--theme-text-secondary)" }}>
              We may update these terms from time to time. Continued use of the service indicates acceptance of any
              updated terms.
            </p>
          </div>

        </div>

        <div className="mt-10">
          <a
            href="/#"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border"
            style={{ borderColor: "var(--theme-border)", color: "var(--theme-text)" }}
          >
            Back to Home
          </a>
        </div>
      </div>
    </section>
  );
}
