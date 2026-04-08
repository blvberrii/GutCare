import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type PolicySection = { title: string; content: React.ReactNode };

const LAST_UPDATED = "8 April 2026";

const sections: PolicySection[] = [
  {
    title: "1. Who We Are",
    content: (
      <p>
        GutCare is developed and operated by Fiona Surja ("we", "our", or "us"). GutCare is a personalized gut health application that helps users evaluate food products based on their specific gut conditions, symptoms, and allergies. For questions about this policy, contact us at <a href="mailto:privacy@gutcare.app" className="text-teal-600 underline">privacy@gutcare.app</a>.
      </p>
    ),
  },
  {
    title: "2. Data We Collect",
    content: (
      <div className="space-y-3">
        <p>We collect the following categories of data when you use GutCare:</p>
        <div className="space-y-2">
          {[
            { label: "Account data", desc: "Username, display name, and encrypted password hash. We never store plain-text passwords." },
            { label: "Health profile", desc: "Gut conditions (e.g. IBS, Crohn's), symptoms, allergies, date of birth, and gender. This is the core of your personalized experience." },
            { label: "Scan history", desc: "Products you scan or search, including the resulting gut health grades, scores, and ingredient analysis. This is stored so you can access your history and favorites." },
            { label: "Chat messages", desc: "Conversations you have with Toto (our AI guide). These are stored so you can review past conversations." },
            { label: "Device/technical data", desc: "Standard server logs including IP address, browser type, and request timestamps. Used for security and error monitoring only." },
          ].map(item => (
            <div key={item.label} className="bg-muted/40 rounded-2xl p-4">
              <p className="font-bold text-sm">{item.label}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">We do <strong className="text-foreground">not</strong> collect payment information, location data, or camera images after analysis is complete. Camera images are processed in memory and never stored on our servers.</p>
      </div>
    ),
  },
  {
    title: "3. How We Use Your Data",
    content: (
      <div className="space-y-2">
        <p>Your data is used only for the following purposes:</p>
        <ul className="space-y-1.5 list-none">
          {[
            "Personalizing gut health grades to your specific conditions and allergies",
            "Providing AI-powered ingredient analysis through our secure Gemini integration",
            "Showing your scan history and saved favorites",
            "Generating personalized product recommendations for you",
            "Maintaining your account and keeping it secure",
            "Improving GutCare's accuracy and functionality (in anonymized, aggregated form only)",
          ].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-teal-500 font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground mt-2">We do <strong className="text-foreground">not</strong> sell your data, use it for advertising, or share it with third parties for their commercial purposes.</p>
      </div>
    ),
  },
  {
    title: "4. Health Data & Sensitivity",
    content: (
      <p>
        Your health profile (conditions, symptoms, allergies) is classified as sensitive personal data. We apply the highest level of protection to this information. It is stored encrypted at rest, transmitted only over HTTPS, and never shared with any third party — including advertising networks, data brokers, or health insurance companies. Only our AI analysis system (Google Gemini, operated under Google's enterprise data processing agreement) accesses this data to generate your personalized scores, and Google does not retain your prompts for model training under our enterprise agreement.
      </p>
    ),
  },
  {
    title: "5. Third-Party Services",
    content: (
      <div className="space-y-3">
        <p>GutCare uses the following third-party services:</p>
        {[
          { name: "Google Gemini (AI analysis)", desc: "Used to analyze product ingredients and generate gut health scores. Data is processed under Google Cloud's enterprise DPA. Google does not use your data for training under our agreement.", link: "https://cloud.google.com/privacy" },
          { name: "Open Food Facts (product images)", desc: "A free, open-source food database used to fetch product images. No personal data is sent — only a product name or barcode number.", link: "https://world.openfoodfacts.org/privacy" },
          { name: "PostgreSQL (Replit-managed)", desc: "Your data is stored in a PostgreSQL database hosted on Replit's infrastructure, which is SOC 2-compliant.", link: "https://replit.com/privacy" },
        ].map(s => (
          <div key={s.name} className="bg-muted/40 rounded-2xl p-4">
            <p className="font-bold text-sm">{s.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
            <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 underline mt-1 block">Privacy policy →</a>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "6. Your Rights",
    content: (
      <div className="space-y-2">
        <p>You have the following rights regarding your personal data:</p>
        <ul className="space-y-1.5 list-none">
          {[
            { right: "Access", desc: "Request a copy of all personal data we hold about you." },
            { right: "Correction", desc: "Update or correct your profile information at any time in Settings." },
            { right: "Deletion", desc: "Request permanent deletion of your account and all associated data. We will complete this within 7 days." },
            { right: "Portability", desc: "Request your scan history and profile data in a machine-readable format (JSON/CSV)." },
            { right: "Objection", desc: "Opt out of any non-essential data processing at any time." },
          ].map(item => (
            <li key={item.right} className="flex gap-3 text-sm">
              <span className="font-bold text-teal-600 w-24 flex-shrink-0">{item.right}</span>
              <span className="text-muted-foreground">{item.desc}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground mt-2">To exercise any of these rights, email us at <a href="mailto:privacy@gutcare.app" className="text-teal-600 underline">privacy@gutcare.app</a>.</p>
      </div>
    ),
  },
  {
    title: "7. Data Retention",
    content: (
      <p>
        We retain your account and health profile data for as long as your account is active. Scan history is retained indefinitely so you can access your full history, but you may delete individual scans at any time. If you delete your account, all data is permanently removed within 7 days. Anonymized, aggregated analytics (e.g. "how many users have IBS") may be retained indefinitely as they contain no personal information.
      </p>
    ),
  },
  {
    title: "8. Security",
    content: (
      <p>
        We protect your data using industry-standard security measures: passwords are hashed using bcrypt (never stored in plain text), all data is transmitted over HTTPS/TLS, the database is encrypted at rest, and access to production systems is strictly controlled. Despite these measures, no system is 100% secure. In the event of a data breach that affects your rights, we will notify you within 72 hours.
      </p>
    ),
  },
  {
    title: "9. Children's Privacy",
    content: (
      <p>
        GutCare is not directed at children under 13. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has registered, please contact us at <a href="mailto:privacy@gutcare.app" className="text-teal-600 underline">privacy@gutcare.app</a> and we will promptly delete the account.
      </p>
    ),
  },
  {
    title: "10. Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top and notify you via the app if the changes are significant. Continued use of GutCare after such changes constitutes your acceptance of the updated policy.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background pb-28 font-sans">
      <header className="p-6 pt-12 flex items-center bg-white border-b sticky top-0 z-10">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-7 h-7" />
          </Button>
        </Link>
        <h1 className="ml-3 text-2xl font-black tracking-tight">Privacy Policy</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl p-6 text-white">
          <p className="text-2xl font-black mb-1">Your privacy matters. 🔐</p>
          <p className="text-teal-100 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed bg-white rounded-2xl p-4 border border-border/50">
          GutCare handles sensitive health data. We've written this policy in plain English so you understand exactly what we collect, why we collect it, and the control you have over it.
        </p>

        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-black text-base">{section.title}</h2>
            <div className="text-sm text-foreground leading-relaxed space-y-2">{section.content}</div>
          </section>
        ))}

        <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-6 text-center space-y-2">
          <p className="font-black">Questions about your privacy?</p>
          <p className="text-sm text-muted-foreground">We respond within 48 hours.</p>
          <a href="mailto:privacy@gutcare.app">
            <Button className="rounded-full bg-primary text-white font-bold px-6 mt-2">Contact privacy@gutcare.app</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
