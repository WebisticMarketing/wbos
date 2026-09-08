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
  ShoppingBag,
  Crown,
  Sparkles,
  Package,
  TrendingUp,
  Menu,
  Phone,
  Paintbrush,
  Instagram,
  X,
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

interface PricingCardProps {
  title: string;
  price: string;
  priceYearly?: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  badge?: string;
  savings?: string;
  featured?: boolean;
  note?: string;
  isMonthly?: boolean;
  index?: number;
  yearlySavings?: string;
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
// PRICING CARD
// ============================================================

function PricingCard({ 
  title, 
  price, 
  priceYearly, 
  description, 
  features, 
  icon: Icon, 
  badge, 
  savings, 
  featured = false, 
  note, 
  isMonthly = false,
  index = 0,
  yearlySavings,
}: PricingCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      custom={index}
      className="h-full"
    >
      <GlassCard featured={featured} className="flex flex-col h-full">
        {badge && (
          <span
            className={`
              inline-block text-[10px] font-medium tracking-wider uppercase px-3 py-0.5 rounded-full mb-3 self-start
              ${featured 
                ? "bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white shadow-lg shadow-[#0068e3]/25" 
                : "bg-white/15 text-white border border-white/15 backdrop-blur-sm"
              }
            `}
          >
            {badge}
          </span>
        )}

        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Icon className="text-white" size={17} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h3>
            <div className="flex items-baseline gap-0.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold text-white">{price}</span>
              {isMonthly && <span className="text-xs text-white/60">/mo</span>}
              {priceYearly && (
                <span className="text-xs text-white/40 ml-2">
                  or <span className="text-white/60 font-medium">{priceYearly}</span>/year
                </span>
              )}
              {yearlySavings && (
                <span className="text-xs text-emerald-400 ml-1">({yearlySavings})</span>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-3">{description}</p>

        {savings && (
          <p className="text-emerald-400 text-xs font-medium mb-2">{savings}</p>
        )}

        <div className="mt-2 pt-3 border-t border-white/10 flex-1">
          <ul className="space-y-1.5">
            {features.map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80"
              >
                <Check size={13} className="text-[#00b8fd] shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {note && (
          <p className="text-[10px] text-white/50 mt-2">{note}</p>
        )}

        <Link
          href="/contact"
          className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-300 mt-4 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white hover:from-[#0052b3] hover:to-[#0068e3] shadow-lg shadow-[#0068e3]/25 hover:shadow-[#0068e3]/40"
        >
          Get Started
          <ArrowRight size={12} />
        </Link>
      </GlassCard>
    </motion.div>
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

function PricingHero() {
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
      aria-label="Pricing hero section"
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
            Transparent Pricing
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto"
          >
            Affordable Website Design{' '}
            <span className="text-[#00b8fd]">&amp; Digital Marketing</span> Packages
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-white max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            Choose from professional website design, Local SEO, Google Ads management, social media marketing, and website maintenance packages designed to help your business generate more leads and grow online.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {["Website Design", "Local SEO", "Google Ads", "No Hidden Fees"].map((item, i) => (
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
// PRICING DATA
// ============================================================

const MONTHLY_SERVICES = [
  {
    icon: ShieldCheck,
    title: "Website Care",
    price: "£30",
    priceYearly: "£300",
    yearlySavings: "Save £60",
    description: "Peace of mind that your website is safe, fast, and always working.",
    features: [
      "Always online — we monitor your website so it never goes down",
      "Hacker protection — we keep your website secure from threats",
      "Automatic backups — your content is always safe",
      "Smooth experience — we fix issues before you notice them",
      "Tech support — we're here when you need help",
    ],
    isMonthly: true,
    note: "Available exclusively for websites developed by Webistic",
    badge: "For Webistic Websites",
  },
  {
    icon: Search,
    title: "Advanced SEO",
    price: "£250",
    description: "Get found on Google and attract more customers.",
    features: [
      "Website audit & keyword research",
      "On-page & local SEO",
      "GMB setup & optimization",
      "Competitor analysis",
      "Monthly reporting",
    ],
    isMonthly: true,
  },
  {
    icon: Users,
    title: "Social Media",
    price: "£150",
    description: "Build your audience and grow your brand.",
    features: [
      "10 Posts + 5 Reels per month",
      "TikTok, Instagram, Facebook",
      "Full platform management",
      "Custom content creation",
      "Monthly performance reports",
    ],
    isMonthly: true,
  },
  {
    icon: BarChart3,
    title: "Google Ads",
    price: "£200",
    description: "Drive immediate leads with expert Ads.",
    features: [
      "Campaign setup & management",
      "Keyword & competitor research",
      "Ad copy & conversion tracking",
      "Budget & bid optimization",
      "Monthly performance reports",
    ],
    isMonthly: true,
    note: "Ad spend paid separately to Google",
  },
];

const WEBSITE_PACKAGES = [
  {
    icon: Layout,
    title: "Launch",
    price: "£499",
    description: "For startups and small businesses.",
    features: [
      "Up to 3 pages",
      "1 year free domain & hosting",
      "Business email (1 year)",
      "Responsive design",
      "1 revision rounds",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Growth",
    price: "£799",
    description: "For growing businesses.",
    features: [
      "Up to 5 pages",
      "2 years free domain & hosting",
      "Business email (1 year)",
      "SEO optimization",
      "Google Analytics",
      "2 revision rounds",
    ],
    badge: "Most Popular",
    featured: true,
  },
  {
    icon: Crown,
    title: "Pro",
    price: "£999",
    description: "For established businesses.",
    features: [
      "Up to 10 pages",
      "3 years free domain & hosting",
      "Business email (1 year)",
      "Booking system",
      "Advanced SEO",
      "AI ChatBot",
      "Google Analytics",
      "3 revision rounds",
    ],
    badge: "Premium",
  },
];

const BUNDLE = {
  icon: Package,
  title: "Webistic Growth Bundle",
  price: "£350",
  description: "SEO + Social Media Management together.",
  features: [
    "Premium SEO (£250 value)",
    "Social Media Management (£150 value)",
    "Website audit & keyword research",
    "10 posts + 5 Reels per month",
    "Instagram, Facebook, TikTok management",
    "Local SEO & Google Business Profile",
    "Monthly reporting",
    "Total value: £400/month",
  ],
  badge: "Best Value",
  savings: "Save £50/month",
  isMonthly: true,
  featured: true,
};

const LOGO_SERVICE = {
  icon: Paintbrush,
  title: "Logo Design",
  price: "£49",
  description: "Professional logo that reflects your brand.",
  features: [
    "Custom design",
    "3 initial concepts",
    "2 revision rounds",
    "SVG, PNG, JPG, PDF",
    "Full commercial rights",
  ],
};

// App Development Packages
const APP_PACKAGES = [
  {
    icon: Layout,
    title: "App Starter",
    price: "£1,499",
    description: "For startups and small businesses.",
    features: [
      "iOS & Android compatible",
      "Up to 5 screens",
      "User authentication",
      "Push notifications",
      "1-month support",
      "App store submission",
    ],
  },
  {
    icon: Crown,
    title: "App Pro",
    price: "£1,999",
    description: "For businesses that need a feature-rich app.",
    features: [
      "iOS & Android compatible",
      "Up to 15 screens",
      "Advanced authentication",
      "Push notifications",
      "In-app purchases",
      "Payment gateway",
      "API integration",
      "Admin dashboard",
      "3-month support",
      "App store submission",
      "Priority support",
    ],
    badge: "Most Popular",
    featured: true,
  },
];

const COMPARISON_FEATURES = [
  { feature: "Revision Rounds", launch: "1", growth: "2", pro: "3" },
  { feature: "Price", launch: "£499", growth: "£799", pro: "£999" },
  { feature: "Pages", launch: "Up to 3", growth: "Up to 5", pro: "Up to 10" },
  { feature: "Free Domain", launch: "1 Year", growth: "2 Years", pro: "3 Years" },
  { feature: "Free Hosting", launch: "1 Year", growth: "2 Years", pro: "3 Years" },
  { feature: "Business Email", launch: "1 Year", growth: "2 Year", pro: "3 Year" },
  { feature: "Responsive Design", launch: true, growth: true, pro: true },
  { feature: "SSL Certificate", launch: true, growth: true, pro: true },
  { feature: "SEO Optimization", launch: false, growth: true, pro: true },
  { feature: "Google Search Console", launch: false, growth: true, pro: true },
  { feature: "Google Analytics", launch: false, growth: true, pro: true },
  { feature: "AI ChatBot", launch: false, growth: false, pro: true },
  { feature: "Booking System", launch: false, growth: false, pro: true },
];

// ============================================================
// SECTIONS
// ============================================================

function MonthlyServicesSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="Monthly services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Monthly Services
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Ongoing Services to{' '}
            <span className="text-[#00b8fd]">Grow Your Business</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base sm:text-lg mt-4">
            Flexible month-to-month services with no long-term contracts.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MONTHLY_SERVICES.map((service, index) => (
            <PricingCard
              key={index}
              index={index}
              title={service.title}
              price={service.price}
              priceYearly={service.priceYearly}
              yearlySavings={service.yearlySavings}
              description={service.description}
              features={service.features}
              icon={service.icon}
              isMonthly={service.isMonthly}
              note={service.note}
              badge={service.badge}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BundleSection() {
  return (
    <section className="relative z-10 py-8 sm:py-12 lg:py-16" aria-label="Bundle">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-8"
        >
          <motion.span variants={itemVariants} className="inline-flex items-center gap-1.5 text-[#00b8fd] text-sm font-medium">
            <TrendingUp size={14} />
            Best Value
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-white mt-1">
            The Complete Growth Solution
          </motion.h2>
        </motion.div>

        <PricingCard
          index={0}
          title={BUNDLE.title}
          price={BUNDLE.price}
          description={BUNDLE.description}
          features={BUNDLE.features}
          icon={BUNDLE.icon}
          badge={BUNDLE.badge}
          savings={BUNDLE.savings}
          isMonthly={BUNDLE.isMonthly}
          featured={BUNDLE.featured}
        />
      </div>
    </section>
  );
}

function WebsitePackagesSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="Website packages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Website Packages
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            One-Time Payment with{' '}
            <span className="text-[#00b8fd]">Free Domain &amp; Hosting</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base sm:text-lg mt-4">
            Professional websites designed to convert visitors into customers.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WEBSITE_PACKAGES.map((pkg, index) => (
            <PricingCard
              key={index}
              index={index}
              title={pkg.title}
              price={pkg.price}
              description={pkg.description}
              features={pkg.features}
              icon={pkg.icon}
              badge={pkg.badge}
              featured={pkg.featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// APP DEVELOPMENT SECTION
// ============================================================

function AppDevelopmentSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="App development packages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            App Development
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Custom Mobile Apps for{' '}
            <span className="text-[#00b8fd]">iOS &amp; Android</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base sm:text-lg mt-4">
            Turn your idea into a fully functional mobile app.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {APP_PACKAGES.map((pkg, index) => (
            <PricingCard
              key={index}
              index={index}
              title={pkg.title}
              price={pkg.price}
              description={pkg.description}
              features={pkg.features}
              icon={pkg.icon}
              badge={pkg.badge}
              featured={pkg.featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonTableSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="Compare packages">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            Comparison
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Compare{' '}
            <span className="text-[#00b8fd]">Packages</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base sm:text-lg mt-4">
            See what's included at a glance.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/10">
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-xs font-medium text-white uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-xs font-medium text-white uppercase tracking-wider">
                      Launch
                    </th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-xs font-medium text-white uppercase tracking-wider">
                      Growth
                    </th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-xs font-medium text-white uppercase tracking-wider">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {COMPARISON_FEATURES.map((item, index) => (
                    <tr
                      key={index}
                      className={`transition-colors ${
                        index % 2 === 0 ? "bg-white/5" : "bg-transparent"
                      } hover:bg-white/10`}
                    >
                      <td className="py-2 sm:py-3 px-3 sm:px-6 text-[10px] sm:text-xs md:text-sm font-medium text-white">
                        {item.feature}
                      </td>
                      <td className="text-center py-2 sm:py-3 px-3 sm:px-6">
                        {typeof item.launch === "boolean" ? (
                          item.launch ? (
                            <div className="flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Check size={16} className="text-emerald-400" strokeWidth={2.5} />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
                                <X size={16} className="text-red-400" strokeWidth={2.5} />
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="text-white text-xs sm:text-sm">{item.launch}</span>
                        )}
                      </td>
                      <td className="text-center py-2 sm:py-3 px-3 sm:px-6">
                        {typeof item.growth === "boolean" ? (
                          item.growth ? (
                            <div className="flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Check size={16} className="text-emerald-400" strokeWidth={2.5} />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
                                <X size={16} className="text-red-400" strokeWidth={2.5} />
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="text-white text-xs sm:text-sm">{item.growth}</span>
                        )}
                      </td>
                      <td className="text-center py-2 sm:py-3 px-3 sm:px-6">
                        {typeof item.pro === "boolean" ? (
                          item.pro ? (
                            <div className="flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Check size={16} className="text-emerald-400" strokeWidth={2.5} />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
                                <X size={16} className="text-red-400" strokeWidth={2.5} />
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="text-white text-xs sm:text-sm">{item.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

function OneTimeServicesSection() {
  return (
    <section className="relative z-10 py-20 sm:py-24 lg:py-28" aria-label="One-time services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span variants={itemVariants} className="text-[#00b8fd] text-sm font-semibold tracking-wider uppercase">
            One-Time Services
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
            Professional Services to{' '}
            <span className="text-[#00b8fd]">Enhance Your Brand</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-white text-base sm:text-lg mt-4">
            One-time investments that make a lasting impression.
          </motion.p>
          <SectionDivider />
        </motion.div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <PricingCard
              index={0}
              title={LOGO_SERVICE.title}
              price={LOGO_SERVICE.price}
              description={LOGO_SERVICE.description}
              features={LOGO_SERVICE.features}
              icon={LOGO_SERVICE.icon}
            />
          </div>
        </div>
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
                Ready to{' '}
                <span className="text-[#00b8fd]">Grow</span> Your Business?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-white text-sm sm:text-base mt-3 max-w-lg mx-auto"
              >
                Book a free consultation. No obligation. Just honest advice.
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Pricing | Webistic Marketing Solutions",
    "description": "Explore our affordable website design, SEO, Google Ads, and social media packages.",
    "url": "https://webistic.co/pricing",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "Product",
          "name": "Website Design Launch Package",
          "description": "Professional website design for startups and small businesses.",
          "offers": {
            "@type": "Offer",
            "price": "499",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Website Design Growth Package",
          "description": "Professional website design for growing businesses.",
          "offers": {
            "@type": "Offer",
            "price": "799",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Website Design Pro Package",
          "description": "Professional website design for established businesses.",
          "offers": {
            "@type": "Offer",
            "price": "999",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Website Care Plan",
          "description": "Keep your Webistic website safe, fast, and always working.",
          "offers": {
            "@type": "Offer",
            "price": "30",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Webistic Growth Bundle",
          "description": "SEO + Social Media Management combined.",
          "offers": {
            "@type": "Offer",
            "price": "350",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Advanced SEO Package",
          "description": "Monthly SEO service to rank higher on Google.",
          "offers": {
            "@type": "Offer",
            "price": "250",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Social Media Management Package",
          "description": "Monthly social media management for your business.",
          "offers": {
            "@type": "Offer",
            "price": "150",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Google Ads Management Package",
          "description": "Monthly Google Ads management to drive leads.",
          "offers": {
            "@type": "Offer",
            "price": "200",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Logo Design Service",
          "description": "Professional logo design for your brand.",
          "offers": {
            "@type": "Offer",
            "price": "49",
            "priceCurrency": "GBP",
            "availability": "https://schema.org/InStock"
          }
        }
      ]
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

export default function PricingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <JsonLd />
      <div className="min-h-screen overflow-x-hidden relative">
        <GradientBackground />
        <Navigation />
        <PricingHero />
        <MonthlyServicesSection />
        <BundleSection />
        <WebsitePackagesSection />
        <AppDevelopmentSection />
        <ComparisonTableSection />
        <OneTimeServicesSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}