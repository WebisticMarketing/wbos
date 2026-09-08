"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  benefits: string[];
  skills: string[];
  email: string;
  gradient: string;
  icon: React.ElementType;
  color: string;
  image?: string;
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

const benefitsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const benefitsItemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6 },
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

function TeamHero() {
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
      aria-label="Team hero section"
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
            Meet Our Team
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto"
          >
            Meet the Team Behind{' '}
            <span className="text-[#00b8fd]">Webistic</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-white max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            We're a team of developers, designers, SEO specialists, and digital marketers working together to help businesses build a stronger online presence, attract more customers, and grow with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {["Web Development", "SEO Strategy", "Google Ads", "Brand & Social"].map((item, i) => (
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
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// TEAM DATA
// ============================================================

const teamMembers = [
  {
    id: 1,
    name: "Awais Khan",
    role: "Founder • Web Development & SEO",
    bio: "Builds modern websites and SEO strategies that help businesses generate more leads and grow online.",
    benefits: [
      "High-performance websites that convert",
      "SEO strategies that rank on Google",
      "Faster load times & better user experience",
      "Technical SEO for long-term growth",
    ],
    skills: ["Website Design", "SEO", "Next.js", "Performance"],
    email: "info@webistic.co",
    gradient: "from-[#0068e3] to-[#00b8fd]",
    icon: Code,
    color: "#0068e3",
    image: "/team/awais-khan.jpg",
  },
  {
    id: 2,
    name: "Ali Khan",
    role: "Google Ads & Digital Marketing",
    bio: "Creates high-performing advertising campaigns that generate quality leads and maximize return on investment.",
    benefits: [
      "Google Ads campaigns that generate leads",
      "PPC strategies with high ROI",
      "Conversion tracking & optimization",
      "Data-driven advertising decisions",
    ],
    skills: ["Google Ads", "PPC Strategy", "Lead Generation", "Analytics"],
    email: "info@webistic.co",
    gradient: "from-[#00b8fd] to-[#0068e3]",
    icon: BarChart3,
    color: "#00b8fd",
    image: "/team/ali-khan.jpg",
  },
  {
    id: 3,
    name: "Mukarram Khan",
    role: "Branding & Social Media",
    bio: "Designs engaging visual content and social media strategies that strengthen brands and increase customer engagement.",
    benefits: [
      "Brand identity that stands out",
      "Social media content that engages",
      "Visual design that converts",
      "Consistent brand messaging",
    ],
    skills: ["Social Media", "Brand Identity", "Graphic Design", "Content"],
    email: "info@webistic.co",
    gradient: "from-[#00d6f7] to-[#0068e3]",
    icon: PenTool,
    color: "#00d6f7",
    image: "/team/mukarram-khan.jpg",
  },
  {
    id: 4,
    name: "Abdullah Reyan",
    role: "App & Web Development",
    bio: "Develops modern web applications and mobile experiences with performance and scalability in mind.",
    benefits: [
      "Mobile apps that users love",
      "Scalable web applications",
      "Smooth user experiences",
      "Modern technology stack",
    ],
    skills: ["Web Apps", "Mobile Apps", "React", "UI Development"],
    email: "info@webistic.co",
    gradient: "from-[#0068e3] to-[#00d6f7]",
    icon: Smartphone,
    color: "#0068e3",
    image: "/team/abdullah-reyan.jpg",
  },
];

// ============================================================
// BENEFITS DATA
// ============================================================

const benefitsData = [
  { 
    icon: Users, 
    label: "One dedicated team",
    description: "A single team focused entirely on your success"
  },
  { 
    icon: MessageCircle, 
    label: "Transparent communication",
    description: "No surprises, just clear and honest updates"
  },
  { 
    icon: Target, 
    label: "Results-focused strategies",
    description: "Every decision driven by your business goals"
  },
  { 
    icon: Shield, 
    label: "Long-term support",
    description: "We're with you every step of the way"
  },
  { 
    icon: Zap, 
    label: "Modern technologies",
    description: "Built with the latest tools and frameworks"
  },
  { 
    icon: Award, 
    label: "Personal service",
    description: "Tailored solutions for your unique needs"
  },
];

// ============================================================
// TEAM SECTION - CAROUSEL
// ============================================================

function TeamSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const totalMembers = teamMembers.length;

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? totalMembers - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(1);
    setCurrentIndex((prev) => (prev === totalMembers - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToIndex = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const member = teamMembers[currentIndex];
  const Icon = member.icon;

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 20000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const arrowVariants = {
    idle: {
      scale: 1,
    },
    hover: {
      scale: 1.1,
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Meet the Team
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Experts Behind Your{' '}
            <span className="text-[#00b8fd]">Online Growth</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base mt-4 max-w-2xl mx-auto">
            Get to know the people who make it happen
          </motion.p>
          <SectionDivider />
        </motion.div>

        {/* Calendar Style Card */}
        <div className="relative">
          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {teamMembers.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? `w-8 bg-gradient-to-r ${member.gradient}`
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to ${teamMembers[index].name}`}
              />
            ))}
          </div>

          {/* Main Card */}
          <GlassCard featured className="overflow-hidden">
            <div className="relative z-10 p-6 sm:p-8 md:p-10">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3 },
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
                >
                  {/* Left Column - Profile */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    {/* Avatar with Image */}
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-xl shadow-[#0068e3]/20 mb-4">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${member.gradient} flex items-center justify-center`}>
                          <Icon size={32} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Name with Email Icon */}
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                      <a
                        href={`mailto:${member.email}`}
                        className="text-white/60 hover:text-[#00b8fd] transition-colors"
                        aria-label="Email"
                      >
                        <Mail size={16} />
                      </a>
                    </div>

                    <p className="text-[#00b8fd] text-base font-medium mt-1">{member.role}</p>
                    
                    <p className="text-white/70 text-sm leading-relaxed mt-3 max-w-md">
                      {member.bio}
                    </p>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                      {member.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 hover:bg-white/20 transition-all duration-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Business Benefits */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={18} className="text-[#00b8fd]" />
                      <h4 className="text-white font-semibold">What This Means For Your Business</h4>
                    </div>

                    <div className="space-y-3 flex-1">
                      {member.benefits.map((benefit, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#00b8fd]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={12} className="text-[#00b8fd]" />
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed">{benefit}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex flex-col items-center gap-2 mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-6">
                  <motion.button
                    onClick={goToPrevious}
                    variants={arrowVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300 flex items-center justify-center"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={20} />
                  </motion.button>
                  <span className="text-white/60 text-xs font-medium min-w-[60px] text-center">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(totalMembers).padStart(2, '0')}
                  </span>
                  <motion.button
                    onClick={goToNext}
                    variants={arrowVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300 flex items-center justify-center"
                    aria-label="Next"
                  >
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
                
                <div className="text-center text-white/40 text-xs">
                  ← Use arrow keys to navigate →
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-white/70 text-sm mb-4">
            Ready to work with our team?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-8 py-3 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-all shadow-lg shadow-[#0068e3]/25"
          >
            Contact Us <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// WHY CHOOSE WEBISTIC
// ============================================================

function WhyChooseWebistic() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Why Choose Webistic
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Why Businesses Choose{' '}
            <span className="text-[#00b8fd]">Webistic</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base mt-4 max-w-2xl mx-auto">
            Here's why businesses trust us to help them grow online
          </motion.p>
          <SectionDivider />
        </motion.div>

        <motion.div
          variants={benefitsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefitsData.map((benefit, index) => {
            const Icon = benefit.icon;
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={index}
                variants={benefitsItemVariants}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="h-full"
              >
                <GlassCard className="flex flex-col h-full text-center">
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4"
                    animate={{
                      scale: isHovered ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon 
                      size={28} 
                      className="text-[#00b8fd] transition-colors duration-300" 
                    />
                  </motion.div>
                  
                  <h3 className="text-white font-bold text-lg">{benefit.label}</h3>
                  <p className="text-white/70 text-sm mt-2 leading-relaxed flex-1">{benefit.description}</p>
                  
                  <motion.div
                    className="h-0.5 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] rounded-full mx-auto mt-3"
                    initial={{ width: 0 }}
                    animate={{ width: isHovered ? "40%" : 0 }}
                    transition={{ duration: 0.4 }}
                  />
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
                Let's Build Something{' '}
                <span className="text-[#00b8fd]">Great Together</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-white text-sm sm:text-base mt-3 max-w-lg mx-auto"
              >
                Whether you're launching a new business, improving your online presence, or looking to generate more leads, our team is ready to help.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-wrap justify-center gap-4 mt-6"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-8 py-3.5 rounded-2xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-all shadow-lg shadow-[#0068e3]/25"
                  >
                    <MessageCircle size={18} aria-hidden="true" />
                    Chat on WhatsApp
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-2xl text-sm font-medium transition-all border border-white/15"
                  >
                    View Pricing <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-white/50 text-sm mt-4"
              >
                No obligation. No hidden fees. Just honest advice.
              </motion.p>
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
    "name": "Our Team | Webistic Marketing Solutions",
    "description": "Meet the Webistic team - strategists, designers, developers, and marketers helping businesses grow.",
    "url": "https://webistic.co/team",
    "mainEntity": {
      "@type": "Organization",
      "name": "Webistic Marketing Solutions",
      "description": "Digital growth partner helping businesses compete and grow online.",
      "url": "https://webistic.co",
      "email": "info@webistic.co",
      "slogan": "Helping Businesses Grow Online.",
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

export default function TeamPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <JsonLd />
      <div className="min-h-screen overflow-x-hidden relative">
        <GradientBackground />
        <Navigation />
        <TeamHero />
        <TeamSection />
        <WhyChooseWebistic />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
