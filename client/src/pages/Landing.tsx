import { Button } from "@/components/ui/button";
import { Link, Redirect } from "wouter";
import { motion } from "framer-motion";
import { 
  Scan, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Star, 
  Download,
  Quote,
  CheckCircle2,
  XCircle,
  Leaf,
  Smile,
  FlaskConical,
  Heart,
  BookOpen,
  Camera,
  Sparkles,
  Brain
} from "lucide-react";
import { TotoAvatar } from "@/components/TotoAvatar";
import { useAuth } from "@/hooks/use-auth";
import founderImg from "@/assets/images/founder.png";


const StepCard = ({ num, icon, title, desc, color }: { num: string; icon: React.ReactNode; title: string; desc: string; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: Number(num) * 0.12 }}
    className="flex flex-col items-center text-center gap-4"
  >
    <div className="relative">
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${color}`}>
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-xs font-black text-gray-700 border border-gray-100">
        {num}
      </div>
    </div>
    <h4 className="font-bold text-lg">{title}</h4>
    <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">{desc}</p>
  </motion.div>
);

const BenefitCard = ({ icon, label, desc, bg, iconColor }: { icon: React.ReactNode; label: string; desc: string; bg: string; iconColor: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 hover:shadow-md transition-shadow"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${bg}`}>
      <span className={iconColor}>{icon}</span>
    </div>
    <h4 className="font-bold text-base mb-1">{label}</h4>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const ConditionPill = ({ emoji, label, color }: { emoji: string; label: string; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm ${color}`}
  >
    <span className="text-lg">{emoji}</span>
    {label}
  </motion.div>
);

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Redirect to="/home" />;

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2D2D2D] selection:bg-teal-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto sticky top-0 bg-[#FFFDF9]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <TotoAvatar size="sm" mood="happy" />
          <span className="font-display font-bold text-2xl text-teal-700">GutCare</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-teal-700 font-medium">Log In</Button>
          </Link>
          <Link href="/auth">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 pt-12 pb-20 max-w-7xl mx-auto text-center relative">
        {/* Decorative blobs */}
        <div className="absolute top-8 left-1/4 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-coral-100 rounded-full blur-3xl opacity-30 -z-10" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
            Understand what's <br />
            <span className="text-teal-600">really in your food.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Scan any product and instantly see how it affects <span className="font-semibold text-coral-500">your</span> specific gut health. No more guesswork, just clarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="rounded-full px-8 py-7 text-lg bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-200 group">
                Start Scanning Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="rounded-full px-8 py-7 border-2">
                <Download className="mr-2 w-5 h-5" /> App Store
              </Button>
            </div>
          </div>
          
          <div className="mt-10 flex justify-center items-center gap-8 text-sm font-medium text-gray-400">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-500" />
              <span>100% Data Privacy</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* How it works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-teal-50 text-teal-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Simple as 1-2-3</span>
            <h2 className="text-4xl font-display font-bold">How GutCare works</h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+40px)] right-[calc(16.66%+40px)] h-0.5 bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-200" />
            <StepCard num="1" icon={<Camera className="w-9 h-9 text-white" />} title="Scan or Search" desc="Point your camera at a barcode or type a product name." color="bg-gradient-to-br from-teal-500 to-teal-600" />
            <StepCard num="2" icon={<FlaskConical className="w-9 h-9 text-white" />} title="Deep Analysis" desc="Every ingredient is matched against your personal gut profile and condition." color="bg-gradient-to-br from-emerald-500 to-teal-600" />
            <StepCard num="3" icon={<Sparkles className="w-9 h-9 text-white" />} title="Your Grade" desc="Get an A–F score personalised to you, with clear positives and negatives." color="bg-gradient-to-br from-teal-600 to-cyan-600" />
          </div>
        </div>
      </section>

      {/* Conditions we support */}
      <section className="py-16 px-6 bg-[#FFFDF9]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold mb-2">Built for <span className="text-teal-600">your</span> gut condition</h2>
            <p className="text-gray-500">We speak the language of gut health — not generic nutrition advice.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <ConditionPill emoji="💨" label="IBS" color="bg-teal-50 text-teal-800" />
            <ConditionPill emoji="🧫" label="SIBO" color="bg-emerald-50 text-emerald-800" />
            <ConditionPill emoji="🔥" label="Crohn's Disease" color="bg-orange-50 text-orange-800" />
            <ConditionPill emoji="🌾" label="Celiac Disease" color="bg-amber-50 text-amber-800" />
            <ConditionPill emoji="🥛" label="Lactose Intolerance" color="bg-blue-50 text-blue-800" />
            <ConditionPill emoji="🌋" label="GERD / Acid Reflux" color="bg-red-50 text-red-800" />
            <ConditionPill emoji="🦠" label="Ulcerative Colitis" color="bg-violet-50 text-violet-800" />
            <ConditionPill emoji="🫀" label="Gastritis" color="bg-pink-50 text-pink-800" />
            <ConditionPill emoji="📋" label="FODMAP" color="bg-purple-50 text-purple-800" />
            <ConditionPill emoji="🌿" label="Leaky Gut" color="bg-lime-50 text-lime-800" />
          </div>
        </div>
      </section>

      {/* Features with Screenshots Section */}
      <section className="bg-white py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-display font-bold mb-4">Precision for your unique gut.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Unlike generic apps, GutCare translates complex science into insights tailored to your sensitivities.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg shadow-teal-200">
                <Scan className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-display font-bold">Instant Barcode Scanning</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Just point your camera at any food product. Toto analyzes the ingredients list in real-time, matching every additive against your personal health profile.
              </p>
              <ul className="space-y-3">
                {["Works on 1.5M+ products", "Detects hidden allergens", "FODMAP analysis"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <div className="relative">
              <div className="absolute inset-0 bg-teal-100 rounded-full blur-3xl opacity-30 -z-10 animate-pulse" />
              <div className="bg-gray-100 rounded-[2.5rem] p-4 shadow-2xl border-8 border-white aspect-[9/16] max-w-[300px] mx-auto overflow-hidden">
                <div className="bg-white h-full w-full rounded-[1.5rem] flex items-center justify-center p-6 text-center">
                  <div>
                    <TotoAvatar size="lg" mood="happy" />
                    <p className="mt-4 font-bold text-teal-700">Scan Complete!</p>
                    <div className="mt-2 text-6xl font-display font-black text-teal-600">A</div>
                    <div className="mt-2 text-sm text-gray-400 font-medium">Great for your gut ✨</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center flex-row-reverse">
            <div className="relative order-2 md:order-1">
              <div className="absolute inset-0 bg-coral-100 rounded-full blur-3xl opacity-30 -z-10" />
              <div className="bg-gray-100 rounded-[2.5rem] p-4 shadow-2xl border-8 border-white aspect-[9/16] max-w-[300px] mx-auto overflow-hidden">
                <div className="bg-white h-full w-full rounded-[1.5rem] p-5">
                  <h4 className="font-bold text-gray-800 mb-1 text-sm">Better Alternatives</h4>
                  <p className="text-xs text-gray-400 mb-4">Gut-friendly swaps for you</p>
                  <div className="space-y-3">
                    {[
                      { grade: "A", color: "bg-teal-500", label: "Sourdough Rye", sub: "Low FODMAP" },
                      { grade: "A-", color: "bg-teal-400", label: "Spelt Bread", sub: "Fermented" },
                      { grade: "B+", color: "bg-emerald-400", label: "Rice Crackers", sub: "Gluten-free" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center text-white font-black text-sm`}>{item.grade}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-xs text-gray-800">{item.label}</div>
                          <div className="text-xs text-gray-400">{item.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 order-1 md:order-2"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-coral-400 to-coral-600 rounded-3xl flex items-center justify-center shadow-lg shadow-coral-200">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-display font-bold">Smart Alternatives</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Found something that isn't right for your gut? GutCare suggests safer, healthier alternatives that won't compromise your comfort or your cravings.
              </p>
              <ul className="space-y-3">
                {["Ranked by your gut score", "Same product category", "Explains why it's better"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <div className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-coral-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-6 bg-[#FFFDF9]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">Everything your gut needs</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Science-backed, personalised, and actually easy to understand.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <BenefitCard icon={<FlaskConical className="w-6 h-6" />} label="Evidence-Based" desc="Graded against Harvard, Johns Hopkins, Cleveland Clinic, and Mayo Clinic research." bg="bg-teal-100" iconColor="text-teal-700" />
            <BenefitCard icon={<Heart className="w-6 h-6" />} label="Personalised Grades" desc="The same product can be A for one gut and D for another. Yours is unique." bg="bg-coral-100" iconColor="text-coral-700" />
            <BenefitCard icon={<Brain className="w-6 h-6" />} label="Chat with Toto" desc="Ask Toto any gut health question and get a calm, expert, friendly answer." bg="bg-purple-100" iconColor="text-purple-700" />
            <BenefitCard icon={<BookOpen className="w-6 h-6" />} label="Citations Included" desc="Every grade links back to the exact study or guideline that informed it." bg="bg-blue-100" iconColor="text-blue-700" />
            <BenefitCard icon={<Leaf className="w-6 h-6" />} label="FODMAP Aware" desc="Built on Monash University's Low-FODMAP database for IBS and SIBO users." bg="bg-green-100" iconColor="text-green-700" />
            <BenefitCard icon={<ShieldCheck className="w-6 h-6" />} label="No Hidden Allergens" desc="Additives, E-numbers, and sneaky ingredients are flagged before you eat them." bg="bg-amber-100" iconColor="text-amber-700" />
          </div>
        </div>
      </section>

      {/* Comparisons Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-16">Compare what works for you.</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-red-50 p-8 rounded-3xl border-2 border-red-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="text-xl font-bold">Avoid</h4>
              </div>
              <p className="text-gray-600 mb-6 italic text-sm">"General advice says wheat is healthy, but for your SIBO..."</p>
              <div className="space-y-3">
                {[
                  { label: "Inulin", sub: "SIBO irritant — ferments in small intestine" },
                  { label: "High Fructose Syrup", sub: "High FODMAP — triggers IBS flares" },
                  { label: "Artificial Sweeteners", sub: "Disrupts gut microbiome balance" },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-white/70 text-red-800 rounded-xl text-sm">
                    <div className="font-bold">{item.label}</div>
                    <div className="text-xs text-red-500 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-teal-50 p-8 rounded-3xl border-2 border-teal-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-teal-500" />
                </div>
                <h4 className="text-xl font-bold">Gut-Friendly</h4>
              </div>
              <p className="text-gray-600 mb-6 italic text-sm">"This sourdough uses natural fermentation which reduces..."</p>
              <div className="space-y-3">
                {[
                  { label: "Low FODMAP Certified", sub: "Monash University approved" },
                  { label: "Prebiotic Fiber", sub: "Feeds Bifidobacterium — reduces bloating" },
                  { label: "Active Live Cultures", sub: "Clinically shown to improve IBS" },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-white/70 text-teal-800 rounded-xl text-sm">
                    <div className="font-bold">{item.label}</div>
                    <div className="text-xs text-teal-600 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Founder Section */}
      <section className="py-28 px-6 bg-teal-700 text-white relative overflow-hidden">
        {/* Glow blobs — kept away from edges so they don't bleed into waves */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-600 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 z-0" />
        {/* Wave top — renders above blobs */}
        <div className="absolute top-0 left-0 w-full leading-none z-10">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 block">
            <path d="M0,0 L1440,0 L1440,55 C1200,75 960,25 720,55 C480,80 240,30 0,55 Z" fill="white" />
          </svg>
        </div>
        {/* Wave bottom — renders above blobs */}
        <div className="absolute bottom-0 left-0 w-full leading-none z-10">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 block">
            <path d="M0,25 C240,55 480,5 720,30 C960,55 1200,10 1440,30 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_2fr] gap-16 items-center relative z-10">
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-3">
              <img src={founderImg} alt="Fiona Surja" className="w-full h-full object-cover object-[center_15%]" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-coral-500 p-6 rounded-2xl shadow-xl -rotate-3">
              <p className="font-display font-bold text-xl">Fiona Surja</p>
              <p className="text-coral-100 text-sm">Founder & Developer</p>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl font-display font-bold">Why I'm building GutCare</h2>
            <div className="prose prose-invert prose-lg max-w-none text-teal-50 space-y-6">
              <p>
                My interest in gut health began during a period when I had to rethink how I evaluated my food. For the first time, I couldn't rely on general nutritional advice; the usual "Increase protein, reduce carbs!" no longer applied. I had to research fibre types, probiotic strains, fermentation, and how specific ingredients interacted with different gut conditions.
              </p>
              <p>
                What made it harder was that the issue wasn't always visible to others — although they were all I thought about. Persistent bloating and digestive discomfort began affecting how I felt in my own body. I realized how closely gut health and confidence are connected. When your body feels unstable, it's difficult to feel grounded.
              </p>
              <p>
                The information exists, but it's difficult to understand. Foods are labelled "gut-friendly", yet rarely specify for whom. Nutrition guidance is generalized, but gut health is highly individualized.
              </p>
              <p>
                That disconnect stayed with me. I built GutCare as the tool I wished I had: scan a product and instantly understand how it supports or disrupts your gut, based on your specific sensitivities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              { num: "1.5M+", label: "Products Analyzed", icon: "📦", bg: "bg-teal-50" },
              { num: "12,400+", label: "Gut Profiles Created", icon: "🧬", bg: "bg-emerald-50" },
              { num: "4.9/5", label: "User Satisfaction", icon: "⭐", bg: "bg-amber-50" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${s.bg} rounded-3xl p-8 text-center`}
              >
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="text-5xl font-display font-black text-teal-700 mb-2">{s.num}</div>
                <div className="text-gray-500 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <Quote className="w-12 h-12 text-teal-200 mx-auto mb-8" />
            <h3 className="text-2xl italic font-medium leading-relaxed mb-8 text-gray-700">
              "For the first time in years, I can grocery shop without anxiety. Toto makes understanding complex labels so simple."
            </h3>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-300 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">S</div>
              <div className="text-left">
                <p className="font-bold">Sarah J.</p>
                <p className="text-sm text-gray-500">IBS Warrior</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-teal-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-700 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 opacity-50" />
          {/* Floating condition pills inside CTA */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 opacity-60 relative z-10">
            {["🌿 IBS", "🌾 Celiac", "🥛 Lactose", "🔥 Crohn's"].map((p, i) => (
              <span key={i} className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">{p}</span>
            ))}
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 relative z-10">Start your journey to gut confidence today.</h2>
          <Link href="/auth">
            <Button size="lg" className="rounded-full px-10 py-8 text-xl bg-white text-teal-700 hover:bg-gray-100 shadow-2xl mb-8 relative z-10">
              Get Started for Free
            </Button>
          </Link>
          <div className="flex justify-center gap-4 opacity-80 scale-90 md:scale-100 relative z-10">
            <Download className="w-8 h-8" />
            <div className="text-left">
              <div className="text-xs uppercase tracking-widest font-bold">Download on the</div>
              <div className="text-xl font-bold">App Store</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 text-center text-gray-400 text-sm space-y-3">
        <p>© 2026 GutCare. Built for gut clarity.</p>
        <div className="flex justify-center gap-6 text-xs">
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
          <a href="mailto:support@gutcare.app" className="hover:text-gray-600 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
