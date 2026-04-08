import { useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, Search, MessageCircle, Scan, User, ShieldCheck, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type FAQ = { q: string; a: string };
type Section = { icon: React.ReactNode; title: string; color: string; faqs: FAQ[] };

const sections: Section[] = [
  {
    icon: <Scan className="w-5 h-5" />,
    title: "Scanning & Products",
    color: "bg-teal-100 text-teal-700",
    faqs: [
      {
        q: "How do I scan a product?",
        a: "Open the Scan tab and point your camera at the product's barcode. GutCare will detect it automatically — no button press needed. If a barcode isn't in our database, tap the 'Label' toggle and photograph the ingredients list instead.",
      },
      {
        q: "What's the difference between Barcode mode and Label mode?",
        a: "Barcode mode scans the numeric barcode on the product and looks it up in our database of 1.5M+ products. Label mode lets you photograph the ingredients text directly — useful for products not in our database, or when you want to scan fresh produce, restaurant menus, or home-cooked meals.",
      },
      {
        q: "The barcode was detected but no result appeared. Why?",
        a: "This usually means the product isn't in our database yet. Switch to Label mode and photograph the full ingredients list — our analysis will work just as accurately. We continuously expand our database.",
      },
      {
        q: "Can I upload a photo from my gallery instead of using the camera?",
        a: "Yes. In Label mode, tap the gallery icon (bottom-left) to upload any photo from your camera roll. Make sure the ingredients label is clearly visible and well-lit.",
      },
      {
        q: "How accurate are the gut health grades?",
        a: "GutCare's grades are based on evidence from Harvard, Johns Hopkins, the Cleveland Clinic, Mayo Clinic, NIH, and Monash University's FODMAP research. Each grade reflects your specific conditions and allergies — the same product might score differently for two users with different profiles. The grades are highly accurate for known additives and FODMAP-classified ingredients.",
      },
      {
        q: "What does the A–F grade mean?",
        a: "A (85–100): Excellent for your gut. B (70–84): Good, minor concerns. C (55–69): Moderate — okay occasionally. D (40–54): Not ideal for your gut. F (below 40): Avoid — likely to trigger your specific conditions. The score is personalized to your gut profile, not a general rating.",
      },
    ],
  },
  {
    icon: <User className="w-5 h-5" />,
    title: "Account & Profile",
    color: "bg-purple-100 text-purple-700",
    faqs: [
      {
        q: "How do I update my gut conditions or allergies?",
        a: "Go to Settings → Health Profile. You can toggle your conditions, allergies, and symptoms at any time. Changes apply immediately to all future scans.",
      },
      {
        q: "Can I change my username or display name?",
        a: "Yes. Go to Settings → Account Details and update your display name or username. Usernames must be lowercase letters, numbers, and underscores only.",
      },
      {
        q: "How do I delete my account?",
        a: "We're adding a dedicated delete-account option. In the meantime, please contact us at support@gutcare.app and we'll permanently delete your account and all associated data within 7 days.",
      },
      {
        q: "Can I change my password?",
        a: "Password management will be added in an upcoming update. For urgent account access issues, contact support@gutcare.app.",
      },
      {
        q: "Is my health data private?",
        a: "Absolutely. Your conditions, allergies, symptoms, and scan history are stored securely and never sold to third parties. See our Privacy Policy for full details.",
      },
    ],
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: "Toto — Your AI Guide",
    color: "bg-blue-100 text-blue-700",
    faqs: [
      {
        q: "Who is Toto?",
        a: "Toto is GutCare's friendly whale mascot and AI-powered gut health guide. You can ask Toto questions about ingredients, conditions, symptoms, gut-friendly foods, and general digestive health in the Chat tab.",
      },
      {
        q: "Is Toto's advice medically approved?",
        a: "Toto provides evidence-based information from reputable health institutions, but this is not a substitute for personalized medical advice. Always consult a registered dietitian or gastroenterologist for diagnosis or treatment.",
      },
      {
        q: "What languages does Toto speak?",
        a: "Toto can respond in any language. Simply type your question in your preferred language — Indonesian, English, Spanish, Chinese, and more.",
      },
      {
        q: "Can I ask Toto about a specific product?",
        a: "Yes! You can copy an ingredients list and paste it into the chat, or simply describe the product and ask Toto to evaluate it for your specific gut profile.",
      },
    ],
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Favorites & History",
    color: "bg-amber-100 text-amber-700",
    faqs: [
      {
        q: "How do I save a product to Favorites?",
        a: "On any scan result page, tap the bookmark icon in the top-right corner. The product will be saved to your Favorites tab for quick access.",
      },
      {
        q: "Where can I see all my past scans?",
        a: "The History tab shows every product you've scanned, sorted by date. You can tap any item to view its full gut health breakdown again.",
      },
      {
        q: "Can I re-analyze a product from my history?",
        a: "Yes. Open any product from your history and tap it to view the full result. Grades won't change unless you update your health profile.",
      },
    ],
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Gut Health Scores",
    color: "bg-green-100 text-green-700",
    faqs: [
      {
        q: "Why does the same product score differently for different people?",
        a: "Because gut health is deeply personal. A product with inulin scores highly for someone with a healthy gut (great prebiotic!), but scores poorly for someone with SIBO or IBS, for whom fermentable fibers are a trigger. GutCare accounts for this through your health profile.",
      },
      {
        q: "What sources does GutCare use for its scoring?",
        a: "Harvard School of Public Health, Johns Hopkins Medicine, Cleveland Clinic, Mayo Clinic, NIH, Monash University FODMAP database, FDA food additive classifications, UK NHS dietary guidelines, and peer-reviewed nutrition research from Oxford and Cambridge.",
      },
      {
        q: "Why does a product with 'natural' ingredients still score badly?",
        a: "Many natural ingredients are high-FODMAP (e.g. honey, garlic, certain fruits) or known gut irritants for specific conditions. 'Natural' doesn't mean gut-safe — it depends entirely on your specific sensitivities.",
      },
      {
        q: "What are additives details?",
        a: "On a scan result, the Additives section lists every E-number or chemical additive found in the product, along with its risk level (Low/Medium/High) and its specific effect on gut health based on published research.",
      },
    ],
  },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between py-4 text-left gap-4"
      >
        <span className="font-bold text-sm text-foreground leading-snug">{faq.q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-4">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpCenter() {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? sections.map(s => ({
        ...s,
        faqs: s.faqs.filter(f =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(s => s.faqs.length > 0)
    : sections;

  return (
    <div className="min-h-screen bg-background pb-28 font-sans">
      <header className="p-6 pt-12 flex items-center bg-white border-b sticky top-0 z-10">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-7 h-7" />
          </Button>
        </Link>
        <h1 className="ml-3 text-2xl font-black tracking-tight">Help Center</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto space-y-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search help articles..."
            className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white border border-border/50 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            data-testid="input-help-search"
          />
        </div>

        {/* Hero */}
        {!search && (
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl p-6 text-white">
            <p className="text-2xl font-black mb-1">How can we help? 🐋</p>
            <p className="text-teal-100 text-sm">Browse topics below or search for anything.</p>
          </div>
        )}

        {/* Sections */}
        {filtered.map((section) => (
          <section key={section.title} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${section.color}`}>
                {section.icon}
              </div>
              <h2 className="font-black text-base">{section.title}</h2>
            </div>
            <div className="bg-white rounded-3xl border border-border/50 shadow-sm px-5">
              {section.faqs.map((faq, i) => <FAQItem key={i} faq={faq} />)}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold text-foreground">No results for "{search}"</p>
            <p className="text-muted-foreground text-sm mt-1">Try different keywords or contact us below.</p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-6 text-center space-y-3">
          <p className="text-2xl">💬</p>
          <p className="font-black">Still need help?</p>
          <p className="text-sm text-muted-foreground">Can't find your answer above? Reach out — we reply within 24 hours.</p>
          <a href="mailto:support@gutcare.app">
            <Button className="rounded-full bg-primary text-white font-bold px-6 mt-2">Email support@gutcare.app</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
