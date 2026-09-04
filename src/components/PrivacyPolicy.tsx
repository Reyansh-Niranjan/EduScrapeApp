export default function PrivacyPolicy() {
  return (
    <section className="min-h-[100dvh] pt-20 sm:pt-28 pb-16 safe-bottom bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 max-w-xl">
        <p className="text-[11px] sm:text-xs font-mono mb-2 sm:mb-3 text-muted-foreground uppercase tracking-wider">
          Effective date: June 1, 2026
        </p>
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mb-6 sm:mb-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          This Privacy Policy explains how NovaSlate collects, uses, and protects your information when you use the
          website and services.
        </p>

        <div className="space-y-6 sm:space-y-8 text-xs sm:text-sm leading-relaxed">
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-2.5 sm:mb-3 text-foreground">
              Information We Collect
            </h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>Account data such as name, grade, email, and authentication identifiers.</li>
              <li>Content you upload or generate (e.g., documents, notes, and project materials).</li>
              <li>Usage signals like page views, feature usage, and error logs for product improvement.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-2.5 sm:mb-3 text-foreground">
              How We Use Information
            </h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>Provide, personalize, and maintain the NovaSlate experience.</li>
              <li>Secure your account and prevent abuse or unauthorized access.</li>
              <li>Improve reliability, analytics, and feature performance.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-2.5 sm:mb-3 text-foreground">
              Third-Party Services
            </h2>
            <p className="text-muted-foreground">
              We use Supabase for authentication, storage, and database services. Google OAuth may be used for single sign
              on. These providers process data according to their own privacy policies.
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-2.5 sm:mb-3 text-foreground">
              Data Security
            </h2>
            <p className="text-muted-foreground">
              We apply reasonable safeguards to protect your information. No method of transmission or storage is 100%
              secure, so we cannot guarantee absolute security.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <a
            href="/#"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md border border-border bg-card text-foreground hover:bg-secondary text-xs font-medium transition-colors touch-manipulation active:scale-95"
          >
            Back to Home
          </a>
        </div>
      </div>
    </section>
  );
}
