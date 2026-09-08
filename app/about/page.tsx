"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Check,
  Users,
  Search,
  ShieldCheck,
  BarChart3,
  Layout,
  Sparkles,
  X,
  Menu,
  Phone,
  Clock,
  Bot,
  MessageCircle,
  Star,
  Shield,
  ThumbsUp,
  Clock as ClockIcon,
  Target,
  Award,
  TrendingUp,
  Lightbulb,
  Rocket,
  Heart,
  Eye,
  Instagram,
} from "lucide-react";

// ============================================================
// CONSTANTS
// ============================================================

const BRAND = {
  name: "Webistic",
  motto: "Helping Businesses Grow Online.",
  url: "https://webistic.co",
  email: "info@webistic.co",
  instagram: "https://instagram.com/webistic.marketing",
};

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Team", href: "/team" },
  { name: "Contact", href: "/contact" },
];

// ============================================================
// TYPES
// ============================================================

interface ValueItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface ApproachItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface ReasonItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

// ============================================================
// CUSTOM HOOKS
// ============================================================

function useScrollDirection() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const frameRef = React.useRef<number>();

  React.useEffect(() => {
    const handleScroll = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 15);
      });
    };

    setIsScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return isScrolled;
}

// ============================================================
// ANIMATIONS
// ============================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const heroVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// ============================================================
// GLASS CARD
// ============================================================

function GlassCard({ children, className = "", featured = false }: { children: React.ReactNode; className?: string; featured?: boolean }) {
  return (
    <div
      className={`
        group relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 
        transition-all duration-500 will-change-transform
        ${featured 
          ? "bg-white/20 backdrop-blur-2xl border border-white/25 shadow-2xl shadow-[#0068e3]/10" 
          : "bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 hover:bg-white/20 hover:-translate-y-1"
        }
        ${className}
      `}
      style={{ transform: "translateZ(0)" }}
    >
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/10 to-white/0 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-t from-[#0068e3]/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {featured && (
        <>
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#00b8fd] to-transparent" />
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0068e3]/10 to-transparent pointer-events-none" />
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#0068e3]/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#00b8fd]/15 rounded-full blur-3xl" />
        </>
      )}
      
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="w-full flex items-center justify-center py-3" aria-hidden="true">
      <div className="w-12 h-0.5 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] rounded-full opacity-40" />
    </div>
  );
}

// ============================================================
// BACKGROUND
// ============================================================

function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[#0a1628]" />

      <div 
        className="absolute top-0 right-0 w-[900px] h-[900px] rounded-full blur-3xl opacity-70"
        style={{
          background: "radial-gradient(circle, #0068e3 0%, #0068e3 15%, rgba(0,104,227,0.4) 35%, rgba(0,104,227,0.15) 55%, transparent 80%)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      <div 
        className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full blur-3xl opacity-60"
        style={{
          background: "radial-gradient(circle, #00b8fd 0%, #00b8fd 15%, rgba(0,184,253,0.3) 35%, rgba(0,184,253,0.1) 55%, transparent 80%)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-3xl opacity-50"
        style={{
          background: "radial-gradient(circle, #1a4a8a 0%, rgba(26,74,138,0.3) 30%, rgba(26,74,138,0.1) 50%, transparent 75%)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      <div 
        className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full blur-3xl opacity-70"
        style={{
          background: "radial-gradient(circle, #3366cc 0%, rgba(51,102,204,0.35) 30%, rgba(51,102,204,0.1) 50%, transparent 80%)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      <div 
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-70"
        style={{
          background: "radial-gradient(circle, #00d6f7 0%, rgba(0,214,247,0.3) 30%, rgba(0,214,247,0.1) 50%, transparent 80%)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[120%] h-[60%] rounded-full opacity-40"
        style={{
          background: "radial-gradient(ellipse at 30% 50%, #00ff88 0%, #00cc66 20%, transparent 70%)",
          filter: "blur(80px)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        animate={{
          x: ["0%", "5%", "-3%", "0%"],
          y: ["0%", "-8%", "5%", "0%"],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-[-10%] right-[-10%] w-[100%] h-[50%] rounded-full opacity-50"
        style={{
          background: "radial-gradient(ellipse at 70% 40%, #00d4ff 0%, #0088ff 30%, transparent 70%)",
          filter: "blur(80px)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        animate={{
          x: ["0%", "-5%", "3%", "0%"],
          y: ["0%", "5%", "-8%", "0%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-[-10%] left-[-5%] w-[80%] h-[50%] rounded-full opacity-35"
        style={{
          background: "radial-gradient(ellipse at 40% 60%, #a855f7 0%, #7c3aed 30%, transparent 70%)",
          filter: "blur(80px)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        animate={{
          x: ["0%", "3%", "-5%", "0%"],
          y: ["0%", "-5%", "8%", "0%"],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-[20%] right-[0%] w-[70%] h-[40%] rounded-full opacity-30"
        style={{
          background: "radial-gradient(ellipse at 60% 70%, #ec4899 0%, #db2777 25%, transparent 65%)",
          filter: "blur(80px)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        animate={{
          x: ["0%", "-4%", "2%", "0%"],
          y: ["0%", "6%", "-4%", "0%"],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-[40%] left-[20%] w-[60%] h-[30%] rounded-full opacity-20"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, #fbbf24 0%, #f59e0b 25%, transparent 65%)",
          filter: "blur(80px)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        animate={{
          x: ["0%", "2%", "-4%", "0%"],
          y: ["0%", "-3%", "6%", "0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,22,40,0.6) 100%)",
        }}
      />
    </div>
  );
}

// ============================================================
// NAVIGATION
// ============================================================

function Navigation() {
  const isScrolled = useScrollDirection();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${isScrolled
          ? "bg-white/15 backdrop-blur-2xl border-b border-white/15 shadow-xl"
          : "bg-transparent border-b border-transparent"
        }
      `}
      style={{ transform: "translateZ(0)" }}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="Webistic Home">
            <motion.div whileHover={{ scale: 1.05 }} className="relative h-8 sm:h-10 w-auto aspect-square">
              <Image
                src="/logo.png"
                alt="Webistic"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 32px, 40px"
              />
            </motion.div>
            <span className="text-base sm:text-lg font-bold tracking-tight">
              <span className="text-white">Web</span>
              <span className="bg-gradient-to-r from-[#0068e3] to-[#00b8fd] bg-clip-text text-transparent font-bold">istic</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative text-sm text-white hover:text-white transition-colors group"
                >
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#00b8fd] rounded-full"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  {!isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#00b8fd] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block"
            >
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-5 py-2 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-all shadow-lg shadow-[#0068e3]/25"
              >
                <Phone size={14} aria-hidden="true" />
                Free Consultation
              </Link>
            </motion.div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`
              md:hidden py-6 border-t 
              ${isScrolled ? "border-white/15" : "border-white/10"}
              bg-white/15 backdrop-blur-2xl rounded-b-2xl -mx-4 sm:-mx-6 px-4 sm:px-6
            `}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col space-y-4">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-base transition-colors py-2 ${
                      isActive ? "text-white font-medium" : "text-white hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-6 py-3 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-all w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone size={14} aria-hidden="true" />
                Free Consultation
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}

// ============================================================
// FOOTER
// ============================================================

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-white/15 backdrop-blur-xl border-t border-white/15 text-white pt-16 pb-8 mt-8">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 pb-12 border-b border-white/10">
          <div className="flex flex-col items-start">
            <div className="relative h-8 sm:h-10 w-auto aspect-square mb-3">
              <Image
                src="/logo.png"
                alt="Webistic"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 32px, 40px"
              />
            </div>
            <p className="text-white font-medium text-sm sm:text-base">Helping Businesses Grow Online.</p>
            <p className="text-white/60 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Professional Website Design, SEO,<br />
              Google Ads &amp; AI Solutions.
            </p>
            <a 
              href="mailto:info@webistic.co" 
              className="text-white/60 text-xs sm:text-sm mt-3 inline-block hover:text-white transition-colors duration-200"
            >
              info@webistic.co
            </a>
            <div className="flex items-center gap-3 mt-3">
              <a
                href="https://instagram.com/webistic.marketing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-[#00b8fd] transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href="/pricing" className="hover:text-white transition-colors duration-200">Pricing</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors duration-200">All Services</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href="/about" className="hover:text-white transition-colors duration-200">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors duration-200">Contact</Link></li>
              <li><Link href="/team" className="hover:text-white transition-colors duration-200">Team</Link></li>
              <li>
                <a
                  href="https://instagram.com/webistic.marketing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors duration-200">Terms &amp; Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 text-center text-white/40 text-xs sm:text-sm">
          &copy; {currentYear} Webistic Marketing Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// HERO
// ============================================================

function AboutHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[70vh] sm:min-h-[75vh] md:min-h-[70vh] lg:min-h-[65vh] flex items-center overflow-hidden"
      style={{
        backgroundImage: "url('/hero-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label="About hero section"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/90 via-[#0a1628]/80 to-[#0a1628]/95 backdrop-blur-sm" aria-hidden="true" />

      <motion.div style={{ opacity: heroOpacity, y: heroY }} className="absolute inset-0" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#0068e3]/12 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#00b8fd]/8 rounded-full blur-3xl"
        />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-medium border border-white/15 mb-6"
          >
            <Sparkles size={12} className="text-[#00b8fd]" aria-hidden="true" />
            About Webistic
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto"
          >
            Growth Starts With{' '}
            <span className="text-[#00b8fd]">the Right Strategy.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-white max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            Businesses don't grow because they have a website. They grow because they have the right strategy, the right systems, and the right partner behind them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {["Strategy", "Technology", "Marketing", "Automation", "Creative"].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-1.5 text-white text-xs bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/15"
              >
                <Check size={10} className="text-[#00b8fd]" />
                {item}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8"
          >
            <p className="text-white/70 text-sm max-w-xl mx-auto">
              At Webistic Marketing Solutions, we help businesses attract customers, strengthen their online presence, improve customer experience, and create sustainable long-term growth through modern digital solutions.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// FOUNDER SECTION
// ============================================================

function FounderSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="Founder message">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left - Founder Image */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#0068e3]/20 border border-white/20">
             <Image
  src="/team/awais-khan.jpg"
  alt="Founder of Webistic"
  width={600}
  height={700}
  className="w-full h-auto object-cover"
  priority
  sizes="(max-width: 768px) 100vw, 50vw"
/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/60 via-transparent to-transparent" />
            </div>
            
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#0068e3]/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#00b8fd]/20 rounded-full blur-2xl" />
          </motion.div>

          {/* Right - Founder Message */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-medium border border-white/15"
            >
              <Sparkles size={12} className="text-[#00b8fd]" />
              Meet the Founder
            </motion.span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              The Vision Behind{' '}
              <span className="text-[#00b8fd]">Webistic</span>
            </h2>

            <div className="space-y-4 text-white/70 text-base leading-relaxed">
              <p>
                Webistic was founded on a single, unwavering belief: <span className="text-white font-medium">every business deserves the opportunity to succeed online.</span>
              </p>
              <p>
                With deep expertise in web development, SEO, and digital marketing, the founder identified a critical gap—exceptional businesses were being overshadowed by competitors with more sophisticated online strategies.
              </p>
              <p>
                Webistic is the solution. Not merely a service provider, but a strategic partner—committed to creating digital ecosystems that generate leads, build visibility, and drive sustainable business growth.
              </p>
            </div>

            {/* Quote from Founder */}
            <div className="relative pl-6 border-l-2 border-[#00b8fd]">
              <p className="text-white/80 italic text-base leading-relaxed">
                "Every business has a story worth telling. Our job is to make sure the right people hear it."
              </p>
              <p className="text-[#00b8fd] text-sm font-medium mt-2">
                Founder &amp; Lead Strategist - Awais Khan
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// ABOUT DATA
// ============================================================

const VALUES: ValueItem[] = [
  {
    icon: Target,
    title: "Strategic Thinking",
    desc: "We believe growth starts with understanding your business, your customers, and your goals before recommending any solution.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    desc: "We stay at the forefront of digital trends, using modern tools and creative thinking to help our clients stand out.",
  },
  {
    icon: Users,
    title: "Partnership",
    desc: "We build long-term relationships based on trust, transparency, and a genuine commitment to our clients' success.",
  },
  {
    icon: Award,
    title: "Excellence",
    desc: "We hold ourselves to high standards, continuously improving our work and striving for outstanding results.",
  },
];

const APPROACH: ApproachItem[] = [
  {
    icon: Search,
    title: "Understand",
    desc: "We take time to understand your business, your industry, your customers, and your unique challenges.",
  },
  {
    icon: Target,
    title: "Strategise",
    desc: "We create a tailored strategy designed around measurable business outcomes—not assumptions.",
  },
  {
    icon: Layout,
    title: "Build",
    desc: "We develop modern, high-performance digital solutions that align with your goals and brand.",
  },
  {
    icon: TrendingUp,
    title: "Optimise",
    desc: "We continuously monitor, test, and refine to ensure your business keeps growing.",
  },
];

const REASONS: ReasonItem[] = [
  {
    icon: Heart,
    title: "We Care About Your Growth",
    desc: "We're not just service providers—we're partners who genuinely want to see your business succeed.",
  },
  {
    icon: Shield,
    title: "Honest & Transparent",
    desc: "We believe in clear communication, honest advice, and no hidden fees or surprises.",
  },
  {
    icon: Rocket,
    title: "Results-Driven",
    desc: "Every decision we make is guided by one question: 'Will this help our client grow?'",
  },
  {
    icon: Eye,
    title: "Forward-Thinking",
    desc: "We help you stay ahead by combining strategy, technology, and creative thinking.",
  },
];

// ============================================================
// SECTIONS
// ============================================================

function WhoWeAreSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="Who we are">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Who We Are
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Your Partner in{' '}
            <span className="text-[#00b8fd]">Business Growth</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base sm:text-lg mt-4">
            Webistic is a digital growth company dedicated to helping businesses unlock new opportunities online.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {VALUES.map((value, index) => (
            <motion.div key={index} variants={cardVariants} className="h-full">
              <GlassCard className="flex flex-col h-full text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0068e3]/30">
                  <value.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed flex-1">{value.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-12 max-w-2xl mx-auto"
        >
          <p className="text-white/80 text-base">
            We combine strategy, technology, marketing, automation, and creative thinking to help businesses become more visible, more competitive, and more profitable.
          </p>
          <p className="text-white/60 text-sm mt-3">
            Every recommendation we make is guided by one question: <span className="text-white font-medium">"Will this help our client grow?"</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function WhatWeBelieveSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="What we believe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            What We Believe
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Growth Happens When{' '}
            <span className="text-[#00b8fd]">Everything Works Together</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base sm:text-lg mt-4">
            Successful businesses aren't built on one marketing channel or one tool.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <GlassCard featured className="text-center max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <Layout size={20} className="text-[#00b8fd]" />
                </div>
                <h4 className="text-white font-semibold text-sm">Customer Experience</h4>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <Search size={20} className="text-[#00b8fd]" />
                </div>
                <h4 className="text-white font-semibold text-sm">Search Visibility</h4>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <BarChart3 size={20} className="text-[#00b8fd]" />
                </div>
                <h4 className="text-white font-semibold text-sm">Advertising</h4>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <Bot size={20} className="text-[#00b8fd]" />
                </div>
                <h4 className="text-white font-semibold text-sm">Automation</h4>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/70 text-sm max-w-2xl mx-auto">
                They grow when every part of their digital presence works together—from customer experience and search visibility to advertising, automation, branding, and ongoing optimisation.
              </p>
              <p className="text-white font-medium text-sm mt-3">
                That's why we focus on building complete growth ecosystems instead of isolated services.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

function ApproachSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="Our approach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Our Approach
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Strategy{' '}
            <span className="text-[#00b8fd]">Before Execution</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base sm:text-lg mt-4">
            Before recommending any solution, we take time to understand your business, your customers, your industry, and your goals.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {APPROACH.map((step, index) => (
            <motion.div key={index} variants={cardVariants} className="h-full">
              <GlassCard className="flex flex-col h-full text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0068e3]/30">
                  <step.icon className="text-white" size={24} />
                </div>
                <div className="text-2xl font-bold text-[#00b8fd]/20 mb-1">0{index + 1}</div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed flex-1">{step.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-white/70 text-sm max-w-2xl mx-auto">
            Because every business is different, every solution should be too.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function WhyChooseUsSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="Why choose us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Why Choose Webistic
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Why Businesses{' '}
            <span className="text-[#00b8fd]">Choose Webistic</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base sm:text-lg mt-4">
            Businesses work with Webistic because they want a partner that understands where they are today—and where they want to be tomorrow.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {REASONS.map((reason, index) => (
            <motion.div key={index} variants={cardVariants} className="h-full">
              <GlassCard className="flex flex-col h-full text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0068e3]/30">
                  <reason.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{reason.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed flex-1">{reason.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-10 max-w-2xl mx-auto"
        >
          <p className="text-white/70 text-sm">
            We value long-term relationships, honest communication, continuous improvement, and measurable progress.
          </p>
          <p className="text-white font-medium text-sm mt-2">
            Our role isn't simply to deliver projects. Our role is to help businesses move forward with confidence.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="Our mission">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Our Mission
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Helping Businesses Build{' '}
            <span className="text-[#00b8fd]">a Stronger Future</span>
          </motion.h2>
          <SectionDivider />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <GlassCard featured className="text-center max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center mb-4 shadow-lg shadow-[#0068e3]/30">
                <Rocket size={28} className="text-white" />
              </div>
              <p className="text-white text-lg leading-relaxed max-w-2xl mx-auto">
                Our mission is to make modern digital growth accessible to businesses of every size.
              </p>
              <p className="text-white/70 text-sm mt-4 max-w-xl mx-auto">
                By combining strategy, innovation, and continuous support, we help organisations adapt, compete, and grow in an increasingly digital world.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="Call to action">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <GlassCard featured className="text-center">
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
              >
                Let's Build Your{' '}
                <span className="text-[#00b8fd]">Next Stage of Growth</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-white text-sm sm:text-base mt-3 max-w-lg mx-auto"
              >
                Whether you're launching a new venture, expanding your reach, or looking for smarter ways to grow, we're ready to help you take the next step.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-8 py-3.5 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-all shadow-lg shadow-[#0068e3]/25"
                >
                  <Phone size={16} aria-hidden="true" />
                  Book Free Consultation
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight size={14} aria-hidden="true" />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// JSON-LD
// ============================================================

function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Webistic Marketing Solutions",
    "description": "Webistic is a digital growth company helping businesses attract customers, strengthen their online presence, and create sustainable long-term growth.",
    "url": "https://webistic.co/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "Webistic Marketing Solutions",
      "description": "Digital growth partner helping businesses compete and grow online.",
      "url": "https://webistic.co",
      "email": "info@webistic.co",
      "foundingDate": "2024",
      "slogan": "Helping Businesses Grow Online."
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <JsonLd />
      <div className="min-h-screen overflow-x-hidden relative">
        <GradientBackground />
        <Navigation />
        <AboutHero />
        
        {/* Founder Section */}
        <FounderSection />
        
        <WhoWeAreSection />
        <WhatWeBelieveSection />
        <ApproachSection />
        <WhyChooseUsSection />
        <MissionSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
