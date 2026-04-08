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
  Smile
} from "lucide-react";
import { TotoAvatar } from "@/components/TotoAvatar";
import { useAuth } from "@/hooks/use-auth";
import founderImg from "@/assets/images/founder.jpg";

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Redirect to="/home" />;

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2D2D2D] selection:bg-teal-100">
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
      <header className="px-6 pt-16 pb-24 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
          
          <div className="mt-16 flex justify-center items-center gap-8 text-sm font-medium text-gray-400">
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
              <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
                <Scan className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-3xl font-display font-bold">Instant Barcode Scanning</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Just point your camera at any food product. Toto analyzes the ingredients list in real-time, matching every additive against your personal health profile.
              </p>
              <ul className="space-y-3">
                {["Works on 1.5M+ products", "Detects hidden allergens", "FODMAP analysis"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-teal-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <div className="relative">
              <div className="absolute inset-0 bg-teal-100 rounded-full blur-3xl opacity-30 -z-10 animate-pulse" />
              <div className="bg-gray-100 rounded-[2.5rem] p-4 shadow-2xl border-8 border-white aspect-[9/16] max-w-[320px] mx-auto overflow-hidden">
                 <div className="bg-white h-full w-full rounded-[1.5rem] flex items-center justify-center p-6 text-center">
                    <div>
                      <TotoAvatar size="lg" mood="happy" />
                      <p className="mt-4 font-bold text-teal-700">Scan Complete!</p>
                      <div className="mt-2 text-6xl font-display font-black text-teal-600">A</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center flex-row-reverse">
             <div className="relative order-2 md:order-1">
              <div className="absolute inset-0 bg-coral-100 rounded-full blur-3xl opacity-30 -z-10" />
              <div className="bg-gray-100 rounded-[2.5rem] p-4 shadow-2xl border-8 border-white aspect-[9/16] max-w-[320px] mx-auto overflow-hidden">
                 <div className="bg-white h-full w-full rounded-[1.5rem] p-6">
                    <h4 className="font-bold text-gray-800 mb-4">Alternatives</h4>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                          <div className="flex-1">
                            <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
                            <div className="h-2 w-12 bg-gray-100 rounded" />
                          </div>
                          <div className="text-teal-600 font-bold">A</div>
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
              <div className="w-12 h-12 bg-coral-100 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-coral-600" />
              </div>
              <h3 className="text-3xl font-display font-bold">Smart Alternatives</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Found something that isn't right for your gut? GutCare suggests safer, healthier alternatives that won't compromise your comfort or your cravings.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparisons Section */}
      <section className="py-24 px-6 bg-[#FFFDF9]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center mb-16">Compare what works for you.</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border-2 border-red-50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="w-8 h-8 text-red-500" />
                <h4 className="text-xl font-bold">Avoid</h4>
              </div>
              <p className="text-gray-600 mb-6 italic">"General advice says wheat is healthy, but for your SIBO..."</p>
              <div className="space-y-4">
                {["Inulin (Irritant)", "High Fructose Syrup", "Artificial Sweeteners"].map((item, i) => (
                  <div key={i} className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border-2 border-teal-50 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-8 h-8 text-teal-500" />
                <h4 className="text-xl font-bold">Gut-Friendly</h4>
              </div>
              <p className="text-gray-600 mb-6 italic">"This sourdough uses natural fermentation which reduces..."</p>
               <div className="space-y-4">
                {["Low FODMAP certified", "Prebiotic fiber", "Active cultures"].map((item, i) => (
                  <div key={i} className="p-3 bg-teal-50 text-teal-700 rounded-xl text-sm font-medium">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Founder Section */}
      <section className="py-24 px-6 bg-teal-700 text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_2fr] gap-16 items-center">
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
            <h2 className="text-4xl font-display font-bold">Why I’m building GutCare</h2>
            <div className="prose prose-invert prose-lg max-w-none text-teal-50 space-y-6">
              <p>
                My interest in gut health began during a period when I had to rethink how I evaluated my food. For the first time, I couldn't rely on general nutritional advice; the usual "Increase protein, reduce carbs!" no longer applied.. I had to research fibre types, probiotic strains, fermentation, and how specific ingredients interacted with different gut conditions.
              </p>
              <p>
                What made it harder was that the issue wasn't always visible to others -- although they were all I thought about. Persistent bloating and digestive discomfort began affecting how I felt in my own body. However, it wasn't just about appearance in a superficial sense, it was about feeling out of control; unsure whether something I had just eaten would help or make thing worse. I realized how closely gut health and confidence are connected. When your body feels unstable, it's difficult to feel grounded.
              </p>
              <p>
                As I researched more, I noticed a larger problem. The information exists, but it's difficult to understand. Probiotic supplements list strain names that read like high-level machine codes, without explaining their function. Foods are labelled "gut-friendly", yet rarely specifies for whom. Nutrition guidance is generalized, but gut health is highly individualized.
              </p>
              <p>
                That disconnect stayed with me. When I later had the opportunity to build an app, I built the tool I wished I had during that time: a way to scan a product and instantly understand how it supports or disrupts your gut, based on your specific sensitivities. Not another diet tracker or generic health app, but something that translates complex nutritional science into clarity at the moment of decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials & Metrics */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-12 mb-24">
            <div>
              <div className="text-5xl font-display font-black text-teal-600 mb-2">1.5M+</div>
              <div className="text-gray-500 font-medium">Products Analyzed</div>
            </div>
            <div>
              <div className="text-5xl font-display font-black text-teal-600 mb-2">12,400+</div>
              <div className="text-gray-500 font-medium">Gut Profiles Created</div>
            </div>
            <div>
              <div className="text-5xl font-display font-black text-teal-600 mb-2">4.9/5</div>
              <div className="text-gray-500 font-medium">User Satisfaction</div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <Quote className="w-12 h-12 text-teal-200 mx-auto mb-8" />
            <h3 className="text-2xl italic font-medium leading-relaxed mb-8 text-gray-700">
              "For the first time in years, I can grocery shop without anxiety. Toto makes understanding complex labels so simple."
            </h3>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
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
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 relative z-10">Start your journey to gut confidence today.</h2>
          <Link href="/auth">
            <Button size="lg" className="rounded-full px-10 py-8 text-xl bg-white text-teal-700 hover:bg-gray-100 shadow-2xl mb-8 relative z-10">
              Get Started for Free
            </Button>
          </Link>
          <div className="flex justify-center gap-4 opacity-80 scale-90 md:scale-100">
            <Download className="w-8 h-8" />
            <div className="text-left">
              <div className="text-xs uppercase tracking-widest font-bold">Download on the</div>
              <div className="text-xl font-bold">App Store</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>© 2026 GutCare. Built for gut clarity.</p>
      </footer>
    </div>
  );
}