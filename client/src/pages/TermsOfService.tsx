import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const LAST_UPDATED = "8 April 2026";

type TermsSection = { title: string; content: React.ReactNode };

const sections: TermsSection[] = [
  {
    title: "1. Acceptance of Terms",
    content: (
      <p>
        By creating an account and using GutCare ("the App", "the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use GutCare. These Terms form a legally binding agreement between you and Fiona Surja, the developer of GutCare ("we", "us", or "our").
      </p>
    ),
  },
  {
    title: "2. Description of Service",
    content: (
      <p>
        GutCare is a personalized gut health application that allows users to scan food product barcodes or photographs of ingredient labels to receive evidence-based gut health assessments (grades A–F, scores 0–100) tailored to their individual health conditions, symptoms, and allergies. The App also provides an AI-powered conversational assistant ("Toto") for general gut health guidance and a product recommendation engine. GutCare is currently free to use.
      </p>
    ),
  },
  {
    title: "3. Important Health Disclaimer",
    content: (
      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="font-bold text-amber-800 text-sm">⚠️ GutCare is not a medical device and does not provide medical advice.</p>
        </div>
        <p>
          The information provided by GutCare — including gut health grades, ingredient analysis, AI chat responses, and product recommendations — is for general informational and educational purposes only. It is not intended to diagnose, treat, cure, or prevent any medical condition or disease.
        </p>
        <p>
          Always consult a qualified healthcare professional, registered dietitian, or gastroenterologist before making significant changes to your diet, especially if you have a diagnosed gut condition such as Crohn's disease, Celiac disease, SIBO, ulcerative colitis, or any other medical condition. GutCare's grades and scores are based on general population research and your self-reported profile — they are not a substitute for professional medical evaluation.
        </p>
      </div>
    ),
  },
  {
    title: "4. Eligibility",
    content: (
      <p>
        You must be at least 13 years old to use GutCare. By creating an account, you confirm that you meet this age requirement. If you are under 18, you should review these Terms with a parent or guardian. GutCare is available worldwide, though some features may vary by region.
      </p>
    ),
  },
  {
    title: "5. Your Account",
    content: (
      <div className="space-y-2">
        <p>When you register for GutCare, you agree to:</p>
        <ul className="space-y-1.5 list-none">
          {[
            "Provide accurate and truthful information about yourself and your health profile",
            "Keep your password secure and not share it with others",
            "Notify us immediately if you suspect unauthorized access to your account",
            "Be responsible for all activity that occurs under your account",
            "Not create multiple accounts or impersonate other people",
          ].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-teal-500 font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground mt-2">We reserve the right to suspend or terminate accounts that violate these Terms.</p>
      </div>
    ),
  },
  {
    title: "6. Acceptable Use",
    content: (
      <div className="space-y-3">
        <p>You agree not to use GutCare to:</p>
        <ul className="space-y-1.5 list-none">
          {[
            "Violate any applicable law or regulation",
            "Attempt to reverse-engineer, hack, or disrupt the App or its servers",
            "Scrape, copy, or harvest data from the App without our written permission",
            "Upload or transmit malicious code, viruses, or any harmful software",
            "Use the App in a way that could damage, disable, overburden, or impair our infrastructure",
            "Attempt to access other users' accounts or data",
            "Use the AI assistant to generate harmful, deceptive, or medically dangerous content",
          ].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-red-400 font-bold">✗</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: "7. Intellectual Property",
    content: (
      <p>
        All content, features, and functionality of GutCare — including the GutCare name, Toto mascot, user interface design, scoring methodology, knowledge base, and software — are owned by Fiona Surja and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on GutCare without our express written permission. Your personal data and scan history remain your own — you retain ownership of the content you provide.
      </p>
    ),
  },
  {
    title: "8. AI-Generated Content",
    content: (
      <p>
        GutCare uses Google Gemini AI to generate ingredient analyses, gut health scores, recommendations, and chat responses. While we apply comprehensive evidence-based prompting and quality controls, AI-generated content may occasionally be inaccurate, incomplete, or inappropriate for your specific situation. You should use your judgment and consult a healthcare professional for decisions affecting your health. We are not liable for decisions you make based solely on AI-generated content from GutCare.
      </p>
    ),
  },
  {
    title: "9. Third-Party Data",
    content: (
      <p>
        Product ingredient information in GutCare's database comes from multiple sources including Open Food Facts (an open-source, community-maintained database) and AI-generated information. We make no warranty that product ingredient lists are complete, up-to-date, or accurate. Manufacturers frequently change formulations. Always check the physical product label before consuming any food product, particularly if you have severe allergies or medical conditions.
      </p>
    ),
  },
  {
    title: "10. Limitation of Liability",
    content: (
      <div className="space-y-3">
        <p>
          To the maximum extent permitted by applicable law, GutCare and Fiona Surja shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:
        </p>
        <ul className="space-y-1.5 list-none">
          {[
            "Your use or inability to use GutCare",
            "Decisions made based on gut health grades or scores in the App",
            "Inaccurate product information from third-party databases",
            "AI-generated content that is inaccurate or inappropriate",
            "Service interruptions, data loss, or security breaches beyond our control",
          ].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-muted-foreground">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm">
          In any case, our total liability to you shall not exceed the amount you have paid us in the past 12 months (which, as GutCare is currently free, is $0). Some jurisdictions do not allow these limitations — in such cases, the limitation will apply to the maximum extent permitted by law.
        </p>
      </div>
    ),
  },
  {
    title: "11. Indemnification",
    content: (
      <p>
        You agree to indemnify and hold harmless GutCare and Fiona Surja from any claims, damages, losses, costs, or expenses (including reasonable legal fees) arising from your violation of these Terms, your misuse of the App, or your infringement of any third-party rights.
      </p>
    ),
  },
  {
    title: "12. Termination",
    content: (
      <p>
        We reserve the right to suspend or terminate your access to GutCare at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. You may delete your account at any time by contacting us at support@gutcare.app. Upon termination, your right to use the App ceases immediately and we will delete your data as described in our Privacy Policy.
      </p>
    ),
  },
  {
    title: "13. Changes to Terms",
    content: (
      <p>
        We may update these Terms from time to time. We will notify you of significant changes via the App or email. The updated Terms will be effective immediately upon posting. Your continued use of GutCare after changes are posted constitutes your acceptance of the new Terms. If you do not agree to the updated Terms, stop using GutCare and delete your account.
      </p>
    ),
  },
  {
    title: "14. Governing Law",
    content: (
      <p>
        These Terms are governed by and construed in accordance with the laws of Indonesia, without regard to its conflict of law principles. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Indonesia. If you access GutCare from another jurisdiction, you are responsible for compliance with local laws.
      </p>
    ),
  },
  {
    title: "15. Contact Us",
    content: (
      <p>
        If you have questions about these Terms of Service, please contact us at{" "}
        <a href="mailto:legal@gutcare.app" className="text-teal-600 underline">legal@gutcare.app</a>.
        For privacy-related queries, contact{" "}
        <a href="mailto:privacy@gutcare.app" className="text-teal-600 underline">privacy@gutcare.app</a>.
        For general support, contact{" "}
        <a href="mailto:support@gutcare.app" className="text-teal-600 underline">support@gutcare.app</a>.
      </p>
    ),
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background pb-28 font-sans">
      <header className="p-6 pt-12 flex items-center bg-white border-b sticky top-0 z-10">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-7 h-7" />
          </Button>
        </Link>
        <h1 className="ml-3 text-2xl font-black tracking-tight">Terms of Service</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl p-6 text-white">
          <p className="text-2xl font-black mb-1">Terms of Service 📋</p>
          <p className="text-gray-300 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed bg-white rounded-2xl p-4 border border-border/50">
          Please read these Terms carefully before using GutCare. They explain your rights, our limitations, and the rules for using the app. We've written them clearly — no unnecessary legalese.
        </p>

        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-black text-base">{section.title}</h2>
            <div className="text-sm text-foreground leading-relaxed space-y-2">{section.content}</div>
          </section>
        ))}

        <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-6 text-center space-y-2">
          <p className="font-black">Questions about these Terms?</p>
          <p className="text-sm text-muted-foreground">Our team responds within 48 hours.</p>
          <a href="mailto:legal@gutcare.app">
            <Button className="rounded-full bg-primary text-white font-bold px-6 mt-2">Contact legal@gutcare.app</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
