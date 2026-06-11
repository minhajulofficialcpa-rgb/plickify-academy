import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Rocket,
  Target,
  Users,
  Laptop,
  Brain,
  TrendingUp,
  Award,
  CheckCircle2,
  Star,
  Zap,
  BookOpen,
  Video,
  MessageCircle,
  Gift,
  Shield,
  Clock,
  BarChart3,
  Layers,
  Palette,
  Settings,
  Search,
  Upload,
  Globe,
  Play,
  Image,
  FileText,
  Share2,
  CreditCard,
  Headphones,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Timer,
  Gem,
  GraduationCap,
  Lightbulb,
  Medal,
} from "lucide-react";

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = targetDate.getTime() - new Date().getTime();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

function AnimatedCounter({ from = 0, to, suffix = "", prefix = "" }: { from?: number; to: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = (to - from) / steps;
    let current = from;
    const timer = setInterval(() => {
      current += increment;
      if (current >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [to, from]);

  return (
    <span className="tabular-nums">
      {prefix}{count.toLocaleString("bn-BD")}{suffix}
    </span>
  );
}

function SectionHeading({ badge, title, subtitle }: { badge?: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="text-center mb-16"
    >
      {badge && (
        <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          {badge}
        </Badge>
      )}
      <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
}

function FloatingOrb({ className, size = 300, color = "rgba(245,158,11,0.08)" }: { className?: string; size?: number; color?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${color}, transparent 70%)`,
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function PricingCard({
  original,
  discounted,
  currency = "৳",
  onEnroll,
}: {
  original: number;
  discounted: number;
  currency?: string;
  onEnroll?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Floating discount badge */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="absolute -top-6 -right-4 z-10"
      >
        <div className="relative">
          <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg shadow-red-500/30">
            <div className="text-[10px] font-normal opacity-80">Save</div>
            {currency}{original - discounted}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[6px] border-transparent border-t-red-500" />
        </div>
      </motion.div>

      <div className="bg-gradient-to-b from-card/90 to-card border border-primary/20 rounded-2xl p-8 md:p-10 shadow-xl shadow-primary/5 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <p className="text-muted-foreground mb-2">Regular Value</p>
            <p className="text-3xl line-through text-muted-foreground/60 mb-1">
              {currency}{original.toLocaleString("bn-BD")}+
            </p>
            <div className="flex items-baseline justify-center gap-2 mt-4">
              <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                {currency}{discounted.toLocaleString("bn-BD")}
              </span>
            </div>
            <div className="mt-3">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1">
                <Zap className="h-3.5 w-3.5 mr-1" />
                84% OFF — Limited Time
              </Badge>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {[
              "AI Microstock Income System",
              "AI Graphics Design For Freelancing",
              "AI Content Creation & Monetization",
              "Advanced Digital Business Strategy",
              "Premium Resource Packs",
              "Live Classes, Recordings & Support",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/25 group"
            onClick={onEnroll}
          >
            এনরোল Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-xs text-muted-foreground/60 text-center mt-3">
            🔒 Secure Payment • Lifetime Access
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ModuleCard({
  icon: Icon,
  title,
  items,
  delay = 0,
  gradient = "from-primary/20 to-primary/5",
}: {
  icon: any;
  title: string;
  items: string[];
  delay?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <div className={`h-full bg-gradient-to-b ${gradient} border border-primary/10 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4 text-primary/60 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const offerEndDate = new Date();
  offerEndDate.setDate(offerEndDate.getDate() + 3);
  const countdown = useCountdown(offerEndDate);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* ==================== NAVBAR ==================== */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm md:text-base">
              <span className="text-primary">AI</span> Income Mastery
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "কোর্স", href: "#curriculum" },
              { label: "প্রাইসিং", href: "#pricing" },
              { label: "সাপোর্ট", href: "#support" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href.slice(1))}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
            <Button size="sm" className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-primary-foreground border-0" onClick={() => scrollToSection("pricing")}>
              এনরোল Now
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-muted-foreground"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-current transition-transform ${showMobileMenu ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transition-opacity ${showMobileMenu ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-current transition-transform ${showMobileMenu ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {[
                  { label: "কোর্স", href: "#curriculum" },
                  { label: "প্রাইসিং", href: "#pricing" },
                  { label: "সাপোর্ট", href: "#support" },
                  { label: "FAQ", href: "#faq" },
                ].map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href.slice(1))}
                    className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </button>
                ))}
                <Button className="w-full bg-gradient-to-r from-primary to-orange-500" onClick={() => scrollToSection("pricing")}>
                  এনরোল Now
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ==================== HERO SECTION ==================== */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />
          <FloatingOrb className="top-20 left-1/4" size={500} color="rgba(245,158,11,0.06)" />
          <FloatingOrb className="bottom-40 right-1/4" size={400} color="rgba(16,185,129,0.05)" />
          <FloatingOrb className="top-1/2 left-1/2" size={350} color="rgba(59,130,246,0.04)" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Batch 2026
                </Badge>
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 px-3 py-1.5">
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                  Plickify Academy
                </Badge>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6">
                <span className="text-foreground">AI দিয়ে</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-orange-400 to-accent bg-clip-text text-transparent">
                  Smart Work,
                </span>
                <br />
                <span className="bg-gradient-to-r from-accent via-primary to-orange-400 bg-clip-text text-transparent">
                  Smart Income
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                AI-Assisted Workflow ব্যবহার করে ৩ মাসে ৩টি Income Stream তৈরি করুন এবং 
                আপনার Skill কে Income-এ Convert করতে শিখুন।
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Clock, label: "Duration", value: "3 Months" },
                  { icon: Video, label: "Live Classes", value: "25+" },
                  { icon: Users, label: "Class Size", value: "VIP" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <stat.icon className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-bold text-sm">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-bold bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/25 group"
                  onClick={() => scrollToSection("pricing")}
                >
                  এখনই এনরোল করুন
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base border-primary/30 hover:bg-primary/5"
                  onClick={() => scrollToSection("curriculum")}
                >
                  <Play className="mr-2 h-5 w-5 text-primary" />
                  কোর্স দেখুন
                </Button>
              </div>

              {/* Countdown */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4 text-primary" />
                  <span>Offer ends in:</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: countdown.days, label: "Days" },
                    { value: countdown.hours, label: "Hrs" },
                    { value: countdown.minutes, label: "Min" },
                    { value: countdown.seconds, label: "Sec" },
                  ].map((unit, i) => (
                    <div
                      key={i}
                      className="bg-card border border-primary/20 rounded-lg px-2.5 py-1.5 text-center min-w-[52px]"
                    >
                      <p className="font-bold text-lg tabular-nums text-primary">
                        {String(unit.value).padStart(2, "0")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{unit.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right visual - Animated showcase */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-br from-card/50 to-card border border-primary/20 rounded-2xl p-8 shadow-2xl shadow-primary/10"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">Plickify Academy</p>
                      <p className="text-xs text-muted-foreground">Batch 2026</p>
                    </div>
                  </div>

                  {/* Income streams preview */}
                  <div className="space-y-4">
                    {[
                      { icon: Image, label: "Microstock Income", value: "$500-2000/mo", color: "from-blue-500 to-cyan-500" },
                      { icon: Palette, label: "Freelance Design", value: "$300-1500/mo", color: "from-purple-500 to-pink-500" },
                      { icon: Play, label: "Content Monetization", value: "$200-1000/mo", color: "from-orange-500 to-red-500" },
                    ].map((stream, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.15 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                      >
                        <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${stream.color} flex items-center justify-center`}>
                          <stream.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{stream.label}</p>
                          <p className="text-xs text-muted-foreground">{stream.value}</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Batch Progress</span>
                      <span className="text-xs font-medium text-primary">Limited Seats</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "68%" }}
                        transition={{ duration: 1.5, delay: 1 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary via-orange-400 to-accent"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border-2 border-background flex items-center justify-center text-[8px] font-bold"
                          >
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                        <div className="h-6 w-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[8px] font-bold">
                          +42
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">68% seats filled</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card 1 */}
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-6 -left-8 bg-card border border-primary/20 rounded-xl p-4 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Medal className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Value: ৳23,000+</p>
                      <p className="text-[10px] text-muted-foreground">Today only ৳3,500</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card 2 */}
                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [0, -1, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -top-4 -right-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 shadow-lg backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-400" />
                    <p className="text-xs font-medium text-green-400">84% OFF</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Scroll to explore</span>
            <div className="w-5 h-8 rounded-full border border-primary/30 flex items-start justify-center p-1.5">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ==================== TRUST BAR / STATS ==================== */}
      <section className="relative border-y border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: 4427, label: "Students Enrolled", suffix: "+" },
              { icon: Star, value: 4.8, label: "Average Rating", suffix: "/5.0" },
              { icon: BookOpen, value: 25, label: "Live Classes", suffix: "+" },
              { icon: Gift, value: 8, label: "Bonus Resources", suffix: "" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl md:text-3xl font-black">
                  <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TARGET AUDIENCE ==================== */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            badge="Target Audience"
            title="এই ব্যাচটি কার জন্য?"
            subtitle="আপনি যদি নিচের যেকোনো একটি গ্রুপের হন, তাহলে এই ব্যাচটি আপনার জন্য"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Palette, title: "Graphics Designers", desc: "Graphics Design শিখেছেন কিন্তু কাজ পাচ্ছেন না" },
              { icon: TrendingUp, title: "Frustrated Freelancers", desc: "Freelancing শিখেছেন কিন্তু Income শুরু করতে পারেননি" },
              { icon: GraduationCap, title: "Students", desc: "যারা পড়াশোনার পাশাপাশি Online Income করতে চান" },
              { icon: Briefcase, title: "Job Holders", desc: "যারা Extra Income Source তৈরি করতে চান" },
              { icon: Laptop, title: "Tech Ready", desc: "যাদের PC/Laptop ও Internet Connection আছে" },
              { icon: Brain, title: "AI Enthusiasts", desc: "যারা AI ব্যবহার করে দ্রুত Skill Develop করতে চান" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group"
              >
                <div className="h-full bg-gradient-to-b from-card/50 to-card border border-white/[0.06] rounded-xl p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Extra condition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 rounded-xl p-5 text-center"
          >
            <p className="text-sm">
              <CheckCircle2 className="h-4 w-4 inline text-primary mr-1.5" />
              <strong>অতিরিক্ত প্রয়োজন: </strong>
              শেখার আগ্রহ, ধৈর্য এবং কাজ করার মানসিকতা
            </p>
          </motion.div>
        </div>
      </section>

      {/* ==================== OUR GOAL ==================== */}
      <section className="relative py-24 bg-gradient-to-b from-background via-primary/[0.02] to-background">
        <FloatingOrb className="top-1/2 left-1/3" size={400} color="rgba(245,158,11,0.04)" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-accent/10 text-accent border-accent/20">
                <Target className="h-3.5 w-3.5 mr-1.5" />
                Our Goal
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Skill কে{' '}
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  Income
                </span>
                -এ Convert করুন
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                বর্তমান AI যুগে শুধুমাত্র Skill থাকলেই হবে না, Skill কে Income-এ Convert করতে জানতে হবে। 
                এই ব্যাচে আমরা AI-Assisted Workflow ব্যবহার করে এমন একটি Practical System শেখাবো যেখানে 
                অনেক Manual কাজ দ্রুত, সহজ এবং Professionalভাবে করা সম্ভব হবে।
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: TrendingUp, label: "Income-Oriented Learning" },
                  { icon: Globe, label: "Real Marketplace Experience" },
                  { icon: Layers, label: "Practical Project Based Training" },
                  { icon: Zap, label: "AI Powered Workflow" },
                  { icon: Award, label: "Portfolio & Asset Building" },
                  { icon: MessageCircle, label: "Long-Term Community Support" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-card/50 to-card border border-primary/20 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">AI-Powered Learning System</p>
                    <p className="text-xs text-muted-foreground">3 Months Transformation</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { phase: "Phase 1", title: "Foundation", desc: "AI Tools & Workflow Setup", progress: 100 },
                    { phase: "Phase 2", title: "Implementation", desc: "Income Stream Creation", progress: 85 },
                    { phase: "Phase 3", title: "Monetization", desc: "Go Live & Earn", progress: 70 },
                    { phase: "Phase 4", title: "Scaling", desc: "Growth & Automation", progress: 50 },
                  ].map((phase, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-primary font-medium">{phase.phase}</span>
                        <span className="text-xs text-muted-foreground">{phase.progress}%</span>
                      </div>
                      <p className="font-medium text-sm">{phase.title}</p>
                      <p className="text-xs text-muted-foreground mb-2">{phase.desc}</p>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${phase.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== CURRICULUM (Income Stream #1) ==================== */}
      <section id="curriculum" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            badge="Income Stream #1"
            title="AI Powered Microstock Income System"
            subtitle="Adobe Stock, Shutterstock, Freepik - Professional Marketplace Setup থেকে Earnings পর্যন্ত পুরো সিস্টেম"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <ModuleCard
              icon={Settings}
              title="Account Setup & Verification"
              delay={0}
              items={[
                "Adobe Stock Contributor",
                "Shutterstock Contributor",
                "Freepik Contributor",
                "VectorStock, Dreamstime, Depositphotos",
                "Professional Profile Setup",
                "Verification Process",
              ]}
            />
            <ModuleCard
              icon={Shield}
              title="Marketplace Rules & Growth"
              delay={0.1}
              items={[
                "Marketplace Guidelines",
                "Account Safety Practices",
                "Approval Rate বৃদ্ধির কৌশল",
                "Rejection কমানোর Best Practices",
                "Download Potential বাড়ানোর Workflow",
                "Marketplace Growth Strategy",
              ]}
            />
            <ModuleCard
              icon={Search}
              title="Niche Research"
              delay={0.2}
              items={[
                "High Demand Niches",
                "Evergreen Niches",
                "Seasonal Niches",
                "Commercial Niches",
                "Ethical & Halal Niches",
              ]}
            />
            <ModuleCard
              icon={Palette}
              title="Design & Asset Creation"
              delay={0.3}
              gradient="from-blue-500/15 to-blue-500/5"
              items={[
                "Adobe Illustrator: Vector, Icon, Pattern",
                "AI Vector Creation",
                "AI Image & PNG Creation",
                "Vectorization & Upscaling",
                "Background Removal",
              ]}
            />
            <ModuleCard
              icon={Layers}
              title="Advanced Workflow"
              delay={0.4}
              gradient="from-purple-500/15 to-purple-500/5"
              items={[
                "Stock Video Creation",
                "Metadata SEO & Keyword Research",
                "Upload Workflow",
                "Asset Optimization",
                "Illustrator Automation",
              ]}
            />
            <ModuleCard
              icon={Gift}
              title="Included Resources"
              delay={0.5}
              gradient="from-green-500/15 to-green-500/5"
              items={[
                "✅ Metadata Generator",
                "✅ AI Prompt Generator",
                "✅ Background Removal Resource",
                "✅ Vector Workflow Resource",
                "✅ Upload Workflow Resource",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ==================== INCOME STREAM #2 ==================== */}
      <section className="relative py-24 bg-gradient-to-b from-background via-primary/[0.02] to-background">
        <FloatingOrb className="top-1/3 right-1/4" size={350} color="rgba(59,130,246,0.04)" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <SectionHeading
            badge="Income Stream #2"
            title="AI Graphics Design For Freelancing"
            subtitle="Freelancer.com থেকে শুরু করে Logo, Banner, Poster Design - সবকিছু AI দিয়ে"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <ModuleCard
              icon={Globe}
              title="Freelancer.com Setup"
              delay={0}
              gradient="from-blue-500/15 to-blue-500/5"
              items={[
                "Professional Profile Creation",
                "Portfolio Setup",
                "Marketplace Optimization",
                "Branding",
              ]}
            />
            <ModuleCard
              icon={Image}
              title="AI Design Creation"
              delay={0.1}
              items={[
                "Logo Design",
                "Banner & Poster Design",
                "Flyer & Brochure Design",
                "Business Card Design",
                "Social Media Design",
              ]}
            />
            <ModuleCard
              icon={FileText}
              title="Editable Design Workflow"
              delay={0.2}
              gradient="from-purple-500/15 to-purple-500/5"
              items={[
                "Photoshop Editing",
                "Illustrator Editing",
                "Canva Editing",
                "Client Ready File Preparation",
              ]}
            />
            <ModuleCard
              icon={Target}
              title="Contest Strategy"
              delay={0.3}
              gradient="from-orange-500/15 to-orange-500/5"
              items={[
                "Contest Research",
                "Contest Participation",
                "Design Improvement Workflow",
                "Professional Submission Strategy",
              ]}
            />
            <ModuleCard
              icon={MessageCircle}
              title="Client Handling"
              delay={0.4}
              gradient="from-green-500/15 to-green-500/5"
              items={[
                "Client Communication",
                "Revision Workflow",
                "Repeat Client Strategy",
                "Professional Communication",
              ]}
            />
            <ModuleCard
              icon={CreditCard}
              title="Payment Setup"
              delay={0.5}
              items={[
                "Withdrawal Setup",
                "Marketplace Verification Guide",
                "Professional Practices",
              ]}
            />
          </div>

          {/* Premium Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Gem className="h-6 w-6 text-primary" />
              <h3 className="font-bold text-xl">Premium Resources Included</h3>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Adobe Photoshop Training",
                "Adobe Illustrator Training",
                "Canva Pro Workflow",
                "ChatGPT Workflow",
                "Leonardo AI Workflow",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== INCOME STREAM #3 ==================== */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            badge="Income Stream #3"
            title="AI Content Creation & Monetization"
            subtitle="YouTube, Facebook, Instagram, TikTok - AI দিয়ে Content তৈরি করুন এবং Monetize করুন"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <ModuleCard
              icon={Share2}
              title="Platform Setup"
              delay={0}
              items={["YouTube", "Facebook", "Instagram", "TikTok"]}
            />
            <ModuleCard
              icon={Search}
              title="Niche Research"
              delay={0.1}
              gradient="from-blue-500/15 to-blue-500/5"
              items={[
                "Bangladesh Market",
                "International Market",
                "Viral Niche Research",
                "Evergreen Niche Selection",
              ]}
            />
            <ModuleCard
              icon={Play}
              title="Content Creation"
              delay={0.2}
              gradient="from-orange-500/15 to-orange-500/5"
              items={[
                "Shorts & Reels",
                "TikTok Videos",
                "Long Form Videos",
                "Faceless Content",
              ]}
            />
            <ModuleCard
              icon={Zap}
              title="AI Production System"
              delay={0.3}
              gradient="from-purple-500/15 to-purple-500/5"
              items={[
                "Script Writing",
                "Voice Over",
                "Character Creation",
                "Thumbnail Design",
                "AI Music Generation",
                "Video Editing Workflow",
              ]}
            />
            <ModuleCard
              icon={BarChart3}
              title="SEO & Growth"
              delay={0.4}
              gradient="from-green-500/15 to-green-500/5"
              items={[
                "Video SEO",
                "Keyword Research",
                "Channel Optimization",
                "Audience Growth Strategy",
                "Monetization Preparation",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ==================== BONUS MODULE ==================== */}
      <section className="relative py-24 bg-gradient-to-b from-background via-[#0a1628] to-background">
        <FloatingOrb className="top-1/3 left-1/4" size={400} color="rgba(245,158,11,0.06)" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <SectionHeading
            badge="🎁 Bonus Module"
            title="Advanced Digital Business Strategy"
            subtitle="ব্র্যান্ডিং, ওয়েবসাইট, ডিজিটাল বিজনেস এবং Meta Ads - সম্পূর্ণ বোনাস"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Award,
                title: "Branding",
                items: ["Personal Branding", "Business Branding"],
                gradient: "from-pink-500/15 to-pink-500/5",
              },
              {
                icon: Globe,
                title: "Website Creation",
                items: [
                  "AI Website Builder",
                  "Landing Page Creation",
                  "WordPress Website",
                  "Vibe Coding Introduction",
                  "Frontend & Backend Basics",
                ],
                gradient: "from-blue-500/15 to-blue-500/5",
              },
              {
                icon: Layers,
                title: "Digital Business",
                items: [
                  "Ready-Made Product Research",
                  "Product Collection System",
                  "Digital Business Resources",
                ],
                gradient: "from-green-500/15 to-green-500/5",
              },
              {
                icon: BarChart3,
                title: "Meta Ads",
                items: [
                  "Campaign Setup",
                  "Audience Targeting",
                  "Optimization Workflow",
                ],
                gradient: "from-orange-500/15 to-orange-500/5",
              },
            ].map((module, i) => (
              <ModuleCard
                key={i}
                icon={module.icon}
                title={module.title}
                items={module.items}
                delay={i * 0.1}
                gradient={module.gradient}
              />
            ))}
          </div>

          {/* Premium Bonus Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/20 rounded-xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Gift className="h-6 w-6 text-yellow-400" />
              <h3 className="font-bold text-xl">🎁 Premium Bonus Resources</h3>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "Graphics Resource Pack",
                "Video Resource Pack",
                "Premium Templates",
                "Office & Productivity Tools",
                "Ebooks & Learning Materials",
                "Business Resources",
                "Premium Guides",
                "Future Updates",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== SUPPORT SYSTEM ==================== */}
      <section id="support" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            badge="Support System"
            title="আমরা আছি আপনার পাশে"
            subtitle="২৪/৭ সাপোর্ট, লাইভ ক্লাস এবং কমিউনিটির মাধ্যমে আপনি কখনো একা হবেন না"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Video, title: "25+ Live Classes", desc: "Weekly 2 Live Classes with Recordings" },
              { icon: MessageCircle, title: "VIP Community", desc: "Dedicated Community Support & Networking" },
              { icon: Headphones, title: "Course Support", desc: "Q&A Sessions & Problem Solving Classes" },
              { icon: Clock, title: "Lifetime Access", desc: "Class Recordings & Future Updates Included" },
              { icon: Star, title: "Bonus Content", desc: "Future Upgrade Information & Emergency Support" },
              { icon: Shield, title: "Risk-Free Trial", desc: "First 2 Classes Free - See the Value First" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group"
              >
                <div className="h-full bg-gradient-to-b from-card/50 to-card border border-white/[0.06] rounded-xl p-6 hover:border-primary/20 transition-all duration-300">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING SECTION ==================== */}
      <section id="pricing" className="relative py-24 bg-gradient-to-b from-background via-primary/[0.03] to-background">
        <FloatingOrb className="top-1/3 left-1/3" size={500} color="rgba(245,158,11,0.05)" />
        <FloatingOrb className="bottom-1/3 right-1/3" size={400} color="rgba(16,185,129,0.04)" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <SectionHeading
            badge="Pricing"
            title="বিনিয়োগ করুন আপনার ভবিষ্যতে"
            subtitle="সীমিত সময়ের অফার - আজই শুরু করুন আপনার Income Journey"
          />

          <div className="max-w-lg mx-auto">
            {/* Value Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 space-y-3"
            >
              {[
                { label: "AI Microstock Income System", value: "৳5,000" },
                { label: "AI Graphics Design For Freelancing", value: "৳5,000" },
                { label: "AI Content Creation & Monetization", value: "৳4,000" },
                { label: "Advanced Digital Business Strategy", value: "৳2,000" },
                { label: "Premium Resource Packs", value: "৳2,000" },
                { label: "Live Classes, Recordings & Support", value: "৳5,000" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                >
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-semibold text-muted-foreground">{item.value}</span>
                </motion.div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="font-bold">Total Value</span>
                <span className="font-bold text-lg text-primary">৳23,000+</span>
              </div>
            </motion.div>

            <PricingCard original={23000} discounted={3500} />

            {/* Special Bonus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-xl p-6">
                <h4 className="font-bold text-lg mb-4">🎯 Special Bonus</h4>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "First 2 Classes Free Trial",
                    "VIP Community Access",
                    "Resource Pack Access",
                    "Future Update Access",
                    "Learning Materials",
                    "Practical Guidance",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Gift className="h-4 w-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section id="faq" className="relative py-24">
        <div className="max-w-3xl mx-auto px-4">
          <SectionHeading
            badge="FAQ"
            title="সাধারণ প্রশ্ন"
            subtitle="আপনার মনে যে প্রশ্নগুলো আসতে পারে"
          />

          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: "এই কোর্সের জন্য কি পূর্ব অভিজ্ঞতা প্রয়োজন?",
                a: "না, পূর্ব অভিজ্ঞতার প্রয়োজন নেই। আমরা বেসিক থেকে শুরু করে অ্যাডভান্সড লেভেল পর্যন্ত সবকিছু শেখাবো। শুধু শেখার আগ্রহ এবং কাজ করার মানসিকতা থাকলেই হবে।"
              },
              {
                q: "কি কি সরঞ্জাম প্রয়োজন?",
                a: "একটি PC বা Laptop এবং Internet Connection থাকলেই চলবে। সমস্ত সফটওয়্যার এবং টুলস সম্পর্কে আমরা কোর্সের মধ্যেই বিস্তারিত গাইডলাইন দেব।"
              },
              {
                q: "ক্লাসের সময় কেমন হবে?",
                a: "সপ্তাহে ২টি লাইভ ক্লাস হবে। প্রতিটি ক্লাসের রেকর্ডিং সংরক্ষিত থাকবে, তাই যেকোনো সময় দেখতে পারবেন।"
              },
              {
                q: "আসলেই ইনকাম করা সম্ভব?",
                a: "হ্যাঁ, আমরা Real Marketplace Experience এবং Practical Project Based Training দিয়ে থাকি। আমাদের লক্ষ্য হলো আপনাকে Income-Oriented Skills শেখানো যা বাস্তব বাজারে কাজে লাগে।"
              },
              {
                q: "রিফান্ড পলিসি কি?",
                a: "আমরা প্রথম ২টি ক্লাস ফ্রি ট্রায়াল দিচ্ছি। আপনি নিজেই দেখে নিতে পারেন কোর্সটি আপনার জন্য কিনা। সম্পূর্ণ কোর্স ফিতে আমাদের কোনো রিফান্ড পলিসি নেই।"
              },
              {
                q: "কোর্স শেষে কি সার্টিফিকেট দেওয়া হয়?",
                a: "হ্যাঁ, কোর্স সফলভাবে সম্পন্ন করলে আপনি Plickify Academy থেকে একটি সার্টিফিকেট পাবেন।"
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <AccordionItem
                  value={`faq-${i}`}
                  className="bg-card/30 border border-white/[0.06] rounded-xl px-6 data-[state=open]:border-primary/20"
                >
                  <AccordionTrigger className="text-sm md:text-base font-medium hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-primary/[0.03] to-background" />
          <FloatingOrb className="top-0 left-1/3" size={600} color="rgba(245,158,11,0.08)" />
          <FloatingOrb className="bottom-0 right-1/3" size={500} color="rgba(16,185,129,0.06)" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20">
              <Rocket className="h-4 w-4 mr-2" />
              Limited Seats Available
            </Badge>

            <h2 className="text-4xl md:text-6xl font-black mb-4">
              🚀 Ready To{" "}
              <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                Start?
              </span>
            </h2>

            <p className="text-xl text-muted-foreground mb-6">
              Learn Smart • Work Faster • Build Your Income Journey
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-bold bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/25 group"
                onClick={() => scrollToSection("pricing")}
              >
                এখনই এনরোল করুন
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <p className="text-muted-foreground">
              <span className="font-semibold text-primary">Plickify Academy</span> — 📞 Contact Now
            </p>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm">
                <span className="text-primary">AI</span> Income Mastery
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Plickify Academy. All rights reserved. |{" "}
              <Link to="/auth" className="underline hover:text-primary transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Briefcase(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}
