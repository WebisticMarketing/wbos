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
Instagram,
} from "lucide-react";

// ============================================================
// CONSTANTS
// ============================================================

const BRAND = {
  name: "Webistic",
  motto: "Helping Businesses Grow Online.",
};

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Team", href: "/team" },
  { name: "Contact", href: "/contact" },
];

const TRUST_BADGES = [
  { icon: Shield, label: "50+ Websites Built" },
  { icon: Star, label: "5-Star Rated" },
  { icon: ThumbsUp, label: "100% Satisfaction" },
  { icon: ClockIcon, label: "5-14 Day Delivery" },
];

// ============================================================
// TYPES
// ============================================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
}

interface ServiceItem {
  icon: React.ElementType;
  title: string;
  desc: string;
  outcome?: string;
}

interface ProblemItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface ProcessStep {
  step: string;
  title: string;
  desc: string;
}

interface FAQItem {
  q: string;
  a: string;
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
// ANIMATIONS - FASTER
// ============================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25 },
  },
};

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

// ============================================================
// GLASS CARD
// ============================================================

function GlassCard({ children, className = "", featured = false }: GlassCardProps) {
  return (
    <div
      className={`
        group relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 
        transition-all duration-300
        ${featured 
          ? "bg-white/20 backdrop-blur-2xl border border-white/25 shadow-2xl shadow-[#0068e3]/10" 
          : "bg-white/15 backdrop-blur-xl border border-white/20 hover:border-white/30 hover:bg-white/20"
        }
        ${className}
      `}
      style={{ 
        transform: "translateZ(0)",
        WebkitBackdropFilter: "blur(20px)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
      
      {featured && (
        <>
          <div className="absolute -top-px left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#00b8fd]/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0068e3]/[0.10] via-transparent to-[#00b8fd]/[0.10] pointer-events-none" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#0068e3]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#00b8fd]/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="absolute -inset-[1px] rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0068e3]/8 via-transparent to-[#00b8fd]/8" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="w-full flex items-center justify-center py-3" aria-hidden="true">
      <div className="w-12 h-0.5 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] rounded-full opacity-30" />
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
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
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
      transition={{ duration: 0.3 }}
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
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
                  className="relative text-sm text-white/80 hover:text-white transition-colors duration-200 group"
                >
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#00b8fd] rounded-full"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  {!isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#00b8fd] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-200" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden md:block"
            >
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-5 py-2 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-colors duration-200 shadow-lg shadow-[#0068e3]/25"
              >
                <Phone size={14} aria-hidden="true" />
                Free Consultation
              </Link>
            </motion.div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
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
            transition={{ duration: 0.15 }}
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
                      isActive ? "text-white font-medium" : "text-white/80 hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-6 py-3 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-colors duration-200 w-full"
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

function Hero() {
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
      className="relative min-h-[85vh] sm:min-h-[90vh] md:min-h-[85vh] lg:min-h-[80vh] flex items-center overflow-hidden"
      style={{
        backgroundImage: "url('/hero-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label="Hero section"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/90 via-[#0a1628]/80 to-[#0a1628]/95 backdrop-blur-sm" aria-hidden="true" />

      <motion.div style={{ opacity: heroOpacity, y: heroY }} className="absolute inset-0" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#0068e3]/12 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
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
            transition={{ duration: 0.3, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-medium border border-white/15 mb-6"
          >
            <Sparkles size={12} className="text-[#00b8fd]" aria-hidden="true" />
            {BRAND.motto}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto"
          >
            Your customers are searching.{' '}
            <span className="text-[#00b8fd]">Make sure they find you.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            We build websites, SEO strategies, and digital marketing campaigns that help businesses attract more customers, generate more leads, and grow online.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-8 py-3.5 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-colors duration-200 shadow-lg shadow-[#0068e3]/25 hover:shadow-[#0068e3]/40"
              >
                <Phone size={16} aria-hidden="true" />
                Get Free Consultation
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap justify-center items-center gap-6 mt-10 pt-8 border-t border-white/10 max-w-2xl mx-auto"
          >
            {TRUST_BADGES.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-2 text-white/70"
              >
                <badge.icon size={16} className="text-[#00b8fd]" aria-hidden="true" />
                <span className="text-xs sm:text-sm">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION DATA
// ============================================================

const PROBLEMS: ProblemItem[] = [
  {
    icon: Search,
    title: "Hard to Get Found",
    desc: "Your customers are searching online every day, but your business isn't appearing where it matters.",
  },
  {
    icon: MessageCircle,
    title: "Not Getting Enough Enquiries",
    desc: "A website should generate leads—not just sit online without delivering results.",
  },
  {
    icon: Users,
    title: "Losing Customers to Competitors",
    desc: "Businesses with stronger online presence often win customers before you even get a chance.",
  },
  {
    icon: Clock,
    title: "Spending Too Much Time",
    desc: "Managing your website, marketing, and enquiries shouldn't take all your time.",
  },
];

const SERVICES: ServiceItem[] = [
  {
    icon: Layout,
    title: "Websites That Convert Visitors Into Customers",
    desc: "Modern, fast, mobile-friendly websites designed to generate enquiries and sales.",
    outcome: "Generate More Leads",
  },
  {
    icon: Search,
    title: "Rank Higher on Google",
    desc: "Improve your Google rankings and attract customers who are actively searching for your services.",
    outcome: "Better Rankings",
  },
  {
    icon: BarChart3,
    title: "Generate More Leads with Google Ads",
    desc: "Reach people actively searching for your services with campaigns focused on enquiries and calls.",
    outcome: "More Bookings",
  },
  {
    icon: Users,
    title: "Build a Stronger Brand Online",
    desc: "Stay visible and engage customers with consistent content across your social channels.",
    outcome: "Build Trust",
  },
  {
    icon: Bot,
    title: "Save Time with AI Automation",
    desc: "Automate customer support, capture leads, and save valuable time.",
    outcome: "Save Time",
  },
  {
    icon: ShieldCheck,
    title: "Keep Your Website Fast & Secure",
    desc: "Ongoing maintenance, security monitoring, and performance optimization.",
    outcome: "Faster Website",
  },
];

const INDUSTRIES = [
  "Driving Schools",
  "Minibus Hire",
  "Barbers & Salons",
  "Dentists",
  "Restaurants",
  "Estate Agents",
  "Trades",
  "Small Businesses",
];

const PROCESS_STEPS: ProcessStep[] = [
  { step: "01", title: "Discovery", desc: "We understand your business, goals, and target audience." },
  { step: "02", title: "Strategy", desc: "We develop a tailored growth strategy for your business." },
  { step: "03", title: "Design & Build", desc: "We create a modern, high-performance digital solution." },
  { step: "04", title: "Launch & Grow", desc: "We launch, monitor, and continuously optimize for results." },
];

const FAQS: FAQItem[] = [
  {
    q: "How much does a professional website cost?",
    a: "We offer three website packages: Business Launch (£499), Business Growth (£799), and Business Pro (£999). Each includes free domain and hosting for 1-3 years. Contact us for a custom quote.",
  },
  {
    q: "How long does it take to build a website?",
    a: "Most websites are completed within 5-14 business days depending on the package and complexity. We'll provide a timeline during our consultation.",
  },
  {
    q: "Will my website be optimized for search engines?",
    a: "Yes. Every website we build includes on-page SEO optimization, Google Search Console setup, and fast loading speeds to help you rank on Google.",
  },
  {
    q: "Do you offer payment plans?",
    a: "Yes. We offer flexible payment plans for all website packages. Contact us to discuss options that work for your budget.",
  },
  {
    q: "Do you offer ongoing support?",
    a: "Yes. Our Website Care Plan (£99/month) provides ongoing maintenance, security monitoring, performance optimization, and up to 2 hours of website edits per month.",
  },
  {
    q: "What industries do you work with?",
    a: "We work with driving schools, minibus hire, barbers, dentists, restaurants, estate agents, trades, and small businesses across the UK.",
  },
];

// ============================================================
// SECTIONS
// ============================================================

function ProblemSection() {
  return (
    <section className="relative z-10 py-16 sm:py-20 lg:py-24" aria-label="Problems we solve">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            The Problem
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Your Business Deserves{' '}
            <span className="text-[#00b8fd]">More Than Just a Website</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white/70 text-base sm:text-lg mt-4">
            Most websites look good. Very few generate enquiries.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROBLEMS.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <GlassCard className="flex flex-col h-full">
                {/* FIXED: Visible icon with gradient background */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0068e3]/50 to-[#00b8fd]/40 backdrop-blur-sm flex items-center justify-center mb-3 flex-shrink-0 border border-white/20 shadow-lg shadow-[#0068e3]/20">
                  <problem.icon className="text-white" size={22} strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{problem.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed flex-1">{problem.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-white/80 text-base font-medium">
            We solve these problems with one complete digital growth solution.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="relative z-10 py-16 sm:py-20 lg:py-24" aria-label="Our services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Our Services
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            How We Help You{' '}
            <span className="text-[#00b8fd]">Grow Online</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white/70 text-base sm:text-lg mt-4">
            Every service is designed to generate one outcome: more customers for your business.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <GlassCard className="flex flex-col h-full">
                {/* FIXED: Visible icon with gradient background */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0068e3]/50 to-[#00b8fd]/40 backdrop-blur-sm flex items-center justify-center mb-3 flex-shrink-0 border border-white/20 shadow-lg shadow-[#0068e3]/20">
                  <service.icon className="text-white" size={22} strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{service.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed flex-1">{service.desc}</p>
                
                {service.outcome && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                    <Check size={13} className="text-[#00b8fd]" aria-hidden="true" />
                    <span className="text-[#00b8fd] text-xs font-medium">{service.outcome}</span>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IndustriesSection() {
  return (
    <section className="relative z-10 py-16 sm:py-20 lg:py-24" aria-label="Industries we serve">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Who We Help
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Helping Businesses Across{' '}
            <span className="text-[#00b8fd]">Every Industry</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white/70 text-base sm:text-lg mt-4">
            From driving schools to estate agents, we create tailored digital solutions for your industry.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <GlassCard>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {INDUSTRIES.map((industry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    viewport={{ once: true }}
                    className="text-center py-2.5 px-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/20 transition-all duration-300"
                  >
                    <span className="text-white font-medium text-sm">{industry}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center mt-5 pt-5 border-t border-white/10"
              >
                <p className="text-white/40 text-sm">And many more...</p>
              </motion.div>
            </GlassCard>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-8"
        >
          <div className="max-w-2xl w-full">
            <GlassCard className="text-center">
              <h3 className="text-base font-bold text-white">Don't See Your Industry?</h3>
              <p className="text-white/60 text-sm mt-1.5 max-w-lg mx-auto">
                Every business is different, but the goal is the same—attract more customers and grow online.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-5 py-2.5 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-colors duration-200 shadow-lg shadow-[#0068e3]/25"
              >
                Let's Talk About Your Business <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="relative z-10 py-16 sm:py-20 lg:py-24" aria-label="Our process">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            How We Work
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            From Strategy to{' '}
            <span className="text-[#00b8fd]">Measurable Growth</span>
          </motion.h2>
          <SectionDivider />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROCESS_STEPS.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <GlassCard featured={index === 0} className="flex flex-col h-full">
                <div className="text-3xl sm:text-4xl font-bold text-[#00b8fd]/20 mb-1 tracking-tighter">
                  {step.step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white flex items-center justify-center text-lg font-bold mb-3 shadow-lg shadow-[#0068e3]/30 flex-shrink-0">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">{step.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed flex-1">{step.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative z-10 py-16 sm:py-20 lg:py-24" aria-label="Frequently asked questions">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            FAQ
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Frequently Asked{' '}
            <span className="text-[#00b8fd]">Questions</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white/70 text-base sm:text-lg mt-4">
            Find answers to the most common questions about our services.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left"
                    aria-expanded={isOpen}
                  >
                    <GlassCard className="hover:bg-white/20 transition-colors duration-200">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-base sm:text-lg font-bold text-white pr-4">
                          {faq.q}
                        </h3>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300">
                          {isOpen ? (
                            <span className="text-[#00b8fd] text-xl">−</span>
                          ) : (
                            <span className="text-[#00b8fd] text-xl">+</span>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 pb-4 px-6 sm:px-8">
                        <div className="pl-3 border-l-2 border-[#00b8fd]/30">
                          <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative z-10 py-16 sm:py-20 lg:py-24" aria-label="Call to action">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          viewport={{ once: true, margin: "-30px" }}
        >
          <GlassCard featured className="text-center">
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
              >
                Let's{' '}
                <span className="text-[#00b8fd]">Grow Your Business</span>{' '}
                Online
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                viewport={{ once: true }}
                className="text-white/70 text-sm sm:text-base mt-2 max-w-lg mx-auto"
              >
                Book a free consultation and discover how the right website, SEO, and digital marketing strategy can help you attract more customers.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 mt-5 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-7 py-3 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-colors duration-200 shadow-lg shadow-[#0068e3]/25 hover:shadow-[#0068e3]/40"
                >
                  <Phone size={15} aria-hidden="true" />
                  Book Free Consultation
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight size={13} aria-hidden="true" />
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
// MAIN PAGE
// ============================================================

export default function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <GradientBackground />
      <Navigation />
      <Hero />
      <ProblemSection />
      <ServicesSection />
      <IndustriesSection />
      <ProcessSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
