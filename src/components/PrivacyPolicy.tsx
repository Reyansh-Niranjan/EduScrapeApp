export default function PrivacyPolicy() {
  return (
    <section className="min-h-screen pt-28 pb-16" style={{ background: "var(--theme-bg)" }}>
      <div className="container mx-auto px-6 max-w-4xl">
        <p className="text-sm mb-3" style={{ color: "var(--theme-text-secondary)" }}>
          Effective date: June 1, 2026
        </p>
        <h1 className="text-4xl font-bold mb-6" style={{ color: "var(--theme-text)" }}>
          Privacy Policy
        </h1>
        <p className="mb-8" style={{ color: "var(--theme-text-secondary)" }}>
          This Privacy Policy explains how EduScrapeApp collects, uses, and protects your information when you use the
          website and services.
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--theme-text)" }}>
              Information We Collect
            </h2>
            <ul className="space-y-2" style={{ color: "var(--theme-text-secondary)" }}>
              <li>Account data such as name, grade, email, and authentication identifiers.</li>
              <li>Content you upload or generate (e.g., documents, notes, and project materials).</li>
              <li>Usage signals like page views, feature usage, and error logs for product improvement.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--theme-text)" }}>
              How We Use Information
            </h2>
            <ul className="space-y-2" style={{ color: "var(--theme-text-secondary)" }}>
              <li>Provide, personalize, and maintain the EduScrapeApp experience.</li>
              <li>Secure your account and prevent abuse or unauthorized access.</li>
              <li>Improve reliability, analytics, and feature performance.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--theme-text)" }}>
              Third-Party Services
            </h2>
            <p style={{ color: "var(--theme-text-secondary)" }}>
              We use Supabase for authentication, storage, and database services. Google OAuth may be used for single sign
              on. These providers process data according to their own privacy policies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--theme-text)" }}>
              Data Security
            </h2>
            <p style={{ color: "var(--theme-text-secondary)" }}>
              We apply reasonable safeguards to protect your information. No method of transmission or storage is 100%
              secure, so we cannot guarantee absolute security.
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
