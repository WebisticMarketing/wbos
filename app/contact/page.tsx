"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Mail,
  Linkedin,
  Twitter,
  User,
  Code,
  PenTool,
  Megaphone,
  Smartphone,
  Zap,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Send,
  Globe,
  Briefcase,
  DollarSign,
  Calendar,
  MapPin,
  CheckCircle,
  HelpCircle,
  Loader2,
  AlertCircle,
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
  whatsapp: "+447353142633",
  phone: "+44 7353 142633",
  location: "United Kingdom",
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

interface FormData {
  fullName: string;
  businessName: string;
  email: string;
  whatsapp: string;
  website: string;
  industry: string;
  services: string[];
  goals: string;
  budget: string;
  preferredContact: string;
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

function ContactHero() {
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
      aria-label="Contact hero section"
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
            Free Consultation
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto"
          >
            Let's Talk About{' '}
            <span className="text-[#00b8fd]">Growing Your Business</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-white max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            Every successful business starts with a conversation. Whether you're looking to attract more customers, improve your online presence, generate more leads, or streamline your business with smarter digital solutions, we're here to help.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {["Free Consultation", "No Obligation", "WhatsApp Response", "Tailored Strategy"].map((item, i) => (
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
            className="mt-8 flex flex-wrap justify-center items-center gap-6"
          >
            <div className="flex items-center gap-2 text-white/60">
              <MessageCircle size={16} className="text-[#00b8fd]" />
              <span className="text-sm">Quick WhatsApp response</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Clock size={16} className="text-[#00b8fd]" />
              <span className="text-sm">Reply within hours</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <CheckCircle size={16} className="text-[#00b8fd]" />
              <span className="text-sm">100% free consultation</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// CONTACT FORM
// ============================================================

const industries = [
  "Barbershop",
  "Driving School",
  "Minibus Hire",
  "Restaurant",
  "Healthcare",
  "Construction",
  "Real Estate",
  "Solicitor",
  "E-commerce",
  "Gym",
  "Cleaning Company",
  "Other",
];

const serviceOptions = [
  { id: "website", label: "Website Design" },
  { id: "seo", label: "SEO" },
  { id: "googleads", label: "Google Ads" },
  { id: "socialmedia", label: "Social Media" },
  { id: "branding", label: "Branding" },
  { id: "maintenance", label: "Website Maintenance" },
  { id: "other", label: "Other" },
];

const budgetOptions = [
  "Under £500",
  "£500–£1,000",
  "£1,000–£2,500",
  "£2,500+",
  "Not Sure",
];

function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    businessName: "",
    email: "",
    whatsapp: "",
    website: "",
    industry: "",
    services: [],
    goals: "",
    budget: "",
    preferredContact: "whatsapp",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formatWebsite = (url: string): string => {
    if (!url) return "";
    url = url.trim();
    if (!url) return "";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => {
      const services = prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId];
      return { ...prev, services };
    });
  };

  const handleContactChange = (method: string) => {
    setFormData((prev) => ({ ...prev, preferredContact: method }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formattedWebsite = formatWebsite(formData.website);

      const payload = {
        ...formData,
        website: formattedWebsite,
        source: "contact_form",
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      setSubmitted(true);
      setIsSubmitting(false);

    } catch (error: any) {
      console.error("Form submission error:", error);
      setSubmitError(error.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[550px] py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Thank You!</h3>
          <p className="text-white/70">
            Your consultation request has been received. We'll review your information and get back to you shortly.
          </p>
          <p className="text-white/50 text-sm mt-4">
            We typically respond within 2-4 hours during business hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-all shadow-lg shadow-[#0068e3]/25"
          >
            Return to Home
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-white text-sm font-medium mb-1.5">
            Full Name <span className="text-[#00b8fd]">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:border-[#00b8fd] focus:outline-none transition-colors"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label htmlFor="businessName" className="block text-white text-sm font-medium mb-1.5">
            Business Name <span className="text-[#00b8fd]">*</span>
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:border-[#00b8fd] focus:outline-none transition-colors"
            placeholder="ABC Plumbing"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-white text-sm font-medium mb-1.5">
            Email Address <span className="text-[#00b8fd]">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:border-[#00b8fd] focus:outline-none transition-colors"
            placeholder="john@email.com"
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className="block text-white text-sm font-medium mb-1.5">
            WhatsApp Number <span className="text-[#00b8fd]">*</span>
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:border-[#00b8fd] focus:outline-none transition-colors"
            placeholder="+44 7123456789"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="website" className="block text-white text-sm font-medium mb-1.5">
            Business Website <span className="text-white/40 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:border-[#00b8fd] focus:outline-none transition-colors"
            placeholder="yourbusiness.com"
          />
          <p className="text-white/20 text-xs mt-1">We'll add https:// for you</p>
        </div>
        <div>
          <label htmlFor="industry" className="block text-white text-sm font-medium mb-1.5">
            Industry <span className="text-[#00b8fd]">*</span>
          </label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white focus:border-[#00b8fd] focus:outline-none transition-colors [&>option]:bg-[#0a1628]"
          >
            <option value="">Select your industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry} className="bg-[#0a1628] text-white">{industry}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          What do you need help with?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {serviceOptions.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => handleServiceToggle(service.id)}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                formData.services.includes(service.id)
                  ? "bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white shadow-lg shadow-[#0068e3]/25"
                  : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
              }`}
            >
              {service.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="goals" className="block text-white text-sm font-medium mb-1.5">
          Business Goals <span className="text-[#00b8fd]">*</span>
        </label>
        <textarea
          id="goals"
          name="goals"
          value={formData.goals}
          onChange={handleInputChange}
          required
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:border-[#00b8fd] focus:outline-none transition-colors resize-y"
          placeholder="Example: I want to generate more leads from Google, improve my website and increase enquiries."
        />
      </div>

      <div>
        <label htmlFor="budget" className="block text-white text-sm font-medium mb-1.5">
          Budget <span className="text-[#00b8fd]">*</span>
        </label>
        <select
          id="budget"
          name="budget"
          value={formData.budget}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white focus:border-[#00b8fd] focus:outline-none transition-colors [&>option]:bg-[#0a1628]"
        >
          <option value="">Select your budget range</option>
          {budgetOptions.map((budget) => (
            <option key={budget} value={budget} className="bg-[#0a1628] text-white">{budget}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Preferred Contact Method
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleContactChange("whatsapp")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex-1 sm:flex-none ${
              formData.preferredContact === "whatsapp"
                ? "bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white shadow-lg shadow-[#0068e3]/25"
                : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
            }`}
          >
            💬 WhatsApp
          </button>
          <button
            type="button"
            onClick={() => handleContactChange("email")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex-1 sm:flex-none ${
              formData.preferredContact === "email"
                ? "bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white shadow-lg shadow-[#0068e3]/25"
                : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
            }`}
          >
            ✉️ Email
          </button>
        </div>
      </div>

      {submitError && (
        <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-6 py-3.5 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-all shadow-lg shadow-[#0068e3]/25 hover:shadow-[#0068e3]/40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Get My Free Consultation
            <Send size={16} />
          </>
        )}
      </button>

      <p className="text-white/40 text-xs text-center">
        By submitting this form, you agree to our privacy policy. Your information will only be used to contact you about your consultation.
      </p>
    </form>
  );
}

// ============================================================
// CONTACT INFO SIDEBAR
// ============================================================

function ContactInfo() {
  const features = [
    "Free Business Consultation",
    "Tailored Growth Strategy",
    "No Hidden Fees",
    "Honest Advice",
    "Fast Response",
  ];

  return (
    <div className="space-y-6">
      <GlassCard className="text-center sm:text-left">
        <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-[#00b8fd]" />
            </div>
            <div>
              <p className="text-white/50 text-xs">Email</p>
              <a href={`mailto:${BRAND.email}`} className="text-white hover:text-[#00b8fd] transition-colors text-sm">
                {BRAND.email}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-[#00b8fd]" />
            </div>
            <div>
              <p className="text-white/50 text-xs">WhatsApp</p>
              <a href={`https://wa.me/${BRAND.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#00b8fd] transition-colors text-sm">
                {BRAND.phone}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={18} className="text-[#00b8fd]" />
            </div>
            <div>
              <p className="text-white/50 text-xs">Location</p>
              <p className="text-white text-sm">{BRAND.location}</p>
            </div>
          </div>
          {/* Instagram */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Instagram size={18} className="text-[#00b8fd]" />
            </div>
            <div>
              <p className="text-white/50 text-xs">Instagram</p>
              <a href="https://instagram.com/webistic.marketing" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#00b8fd] transition-colors text-sm">
                @webistic.marketing
              </a>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="text-center sm:text-left">
        <h4 className="text-lg font-bold text-white mb-3">Business Hours</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Monday – Friday</span>
            <span className="text-white">9:00 AM – 6:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Saturday</span>
            <span className="text-white">10:00 AM – 2:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Sunday</span>
            <span className="text-white/40">Closed</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="text-center sm:text-left">
        <h4 className="text-lg font-bold text-white mb-3">Why Contact Webistic?</h4>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
              <Check size={14} className="text-[#00b8fd] flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

// ============================================================
// FAQ SECTION
// ============================================================

const faqs = [
  {
    q: "How quickly will you reply?",
    a: "Usually within a few hours during business hours.",
  },
  {
    q: "Is the consultation free?",
    a: "Yes. Every consultation is completely free with no obligation.",
  },
  {
    q: "Do you work with businesses outside the UK?",
    a: "Yes. We work with businesses worldwide.",
  },
  {
    q: "Can I contact you on WhatsApp?",
    a: "Absolutely. WhatsApp is our primary communication channel.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="Frequently asked questions">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            FAQ
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Frequently Asked{' '}
            <span className="text-[#00b8fd]">Questions</span>
          </motion.h2>
          <SectionDivider />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div key={index} variants={itemVariants}>
                <GlassCard>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full text-left flex items-center justify-between gap-4"
                  >
                    <h3 className="text-lg font-bold text-white">{faq.q}</h3>
                    <span className="text-white/40 text-xl flex-shrink-0">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="text-white/70 text-sm sm:text-base mt-3 leading-relaxed"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// CTA SECTION
// ============================================================

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
                Ready to{' '}
                <span className="text-[#00b8fd]">Grow Your Business?</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-white text-sm sm:text-base mt-3 max-w-lg mx-auto"
              >
                Let's discuss your goals and build a strategy that helps your business attract more customers, increase visibility, and achieve sustainable growth.
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
                  href="#contact-form"
                  className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-8 py-3.5 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-all shadow-lg shadow-[#0068e3]/25"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  Get Free Consultation
                  <ArrowRight size={14} aria-hidden="true" />
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

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <GradientBackground />
      <Navigation />
      <ContactHero />

      <section id="contact-form" className="relative z-10 py-20 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
          >
            <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
              Tell Us About Your Business
            </motion.span>
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
              Start Your{' '}
              <span className="text-[#00b8fd]">Growth Conversation</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-white text-base sm:text-lg mt-4">
              Complete the form below and we'll review your requirements before getting in touch. The more information you provide, the better advice we can give.
            </motion.p>
            <SectionDivider />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <GlassCard>
                <ContactForm />
              </GlassCard>
            </div>
            <div className="lg:col-span-1">
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>

      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
