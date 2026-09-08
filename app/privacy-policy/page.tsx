"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Cookie,
  Eye,
  Database,
  Lock,
  X,
  Menu,
  Phone,
  Sparkles,
  Check,
  ExternalLink,
  FileText,
  Instagram,
} from "lucide-react";

// ============================================================
// CONSTANTS
// ============================================================

const BRAND = {
  name: "Webistic Marketing Solutions",
  shortName: "Webistic",
  motto: "Helping Businesses Grow Online.",
  email: "info@webistic.co",
  whatsapp: "+44 7353 142633",
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
// GLASS CARD
// ============================================================

function GlassCard({ children, className = "", featured = false }: { children: React.ReactNode; className?: string; featured?: boolean }) {
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
      <div className="absolute inset-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
      {featured && (
        <>
          <div className="absolute -top-px left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#00b8fd]/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0068e3]/[0.10] via-transparent to-[#00b8fd]/[0.10] pointer-events-none" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#0068e3]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#00b8fd]/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}
      <div className="relative z-10">{children}</div>
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
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-70"
        style={{
          background: "radial-gradient(circle, #00d6f7 0%, rgba(0,214,247,0.3) 30%, rgba(0,214,247,0.1) 50%, transparent 80%)",
          willChange: "transform",
          transform: "translateZ(0)",
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
      transition={{ duration: 0.4 }}
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
                      transition={{ duration: 0.3 }}
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
              transition={{ delay: 0.3 }}
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
            transition={{ duration: 0.2 }}
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
// PRIVACY POLICY CONTENT
// ============================================================

const sections = [
  {
    id: "who-we-are",
    icon: Shield,
    title: "Who We Are",
    content: (
      <div className="space-y-4 text-white/60 text-sm leading-relaxed">
        <p>
          Webistic Marketing Solutions is a digital marketing agency providing services including:
        </p>
        <ul className="space-y-1.5 list-disc list-inside ml-2">
          <li>Website Design &amp; Development</li>
          <li>Search Engine Optimization (SEO)</li>
          <li>Google Ads Management</li>
          <li>Social Media Marketing</li>
          <li>Website Maintenance</li>
          <li>Branding &amp; Graphic Design</li>
        </ul>
        <p>
          For any privacy-related questions, contact us at:
        </p>
        <div className="bg-white/5 rounded-xl p-3 mt-2">
          <p className="text-white/80"><strong>Email:</strong> <a href={`mailto:${BRAND.email}`} className="text-[#00b8fd] hover:underline">{BRAND.email}</a></p>
          <p className="text-white/80"><strong>WhatsApp:</strong> <a href={`https://wa.me/${BRAND.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-[#00b8fd] hover:underline">{BRAND.whatsapp}</a></p>
        </div>
      </div>
    ),
  },
  {
    id: "information-we-collect",
    icon: Database,
    title: "Information We Collect",
    content: (
      <div className="space-y-4 text-white/60 text-sm leading-relaxed">
        <p>We may collect the following information when you use our website or contact us:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-semibold text-sm mb-2">Personal Information</h4>
            <ul className="space-y-1.5 list-disc list-inside ml-2">
              <li>Full Name</li>
              <li>Business Name</li>
              <li>Email Address</li>
              <li>Phone Number</li>
              <li>WhatsApp Number</li>
              <li>Website URL</li>
              <li>Project Requirements</li>
            </ul>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-semibold text-sm mb-2">Technical Information</h4>
            <ul className="space-y-1.5 list-disc list-inside ml-2">
              <li>IP Address</li>
              <li>Browser Type</li>
              <li>Device Information</li>
              <li>Pages Visited</li>
              <li>Cookies</li>
              <li>Website Usage Data</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use",
    icon: Eye,
    title: "How We Use Your Information",
    content: (
      <div className="space-y-4 text-white/60 text-sm leading-relaxed">
        <p>We use your information to:</p>
        <ul className="space-y-1.5 list-disc list-inside ml-2">
          <li>Respond to enquiries</li>
          <li>Provide quotations</li>
          <li>Deliver our services</li>
          <li>Improve our website</li>
          <li>Communicate project updates</li>
          <li>Provide customer support</li>
          <li>Send important service information</li>
          <li>Analyse website performance</li>
          <li>Improve user experience</li>
        </ul>
        <p className="text-white/80 font-medium">We never sell your personal information.</p>
      </div>
    ),
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies",
    content: (
      <div className="space-y-4 text-white/60 text-sm leading-relaxed">
        <p>Our website uses cookies to:</p>
        <ul className="space-y-1.5 list-disc list-inside ml-2">
          <li>Improve website functionality</li>
          <li>Remember your preferences</li>
          <li>Measure website traffic</li>
          <li>Understand visitor behaviour</li>
          <li>Improve website performance</li>
        </ul>
        <p>You can manage or disable cookies through your browser settings or our Cookie Preferences.</p>
      </div>
    ),
  },
  {
    id: "third-party",
    icon: ExternalLink,
    title: "Third-Party Services",
    content: (
      <div className="space-y-4 text-white/60 text-sm leading-relaxed">
        <p>We may use trusted third-party services including:</p>
        <div className="flex flex-wrap gap-2">
          {["Google Analytics", "Google Ads", "Google Search Console", "Microsoft Clarity", "Meta Pixel", "Cloud Hosting Providers", "Email Services"].map((service, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs">{service}</span>
          ))}
        </div>
        <p>These providers may collect information in accordance with their own privacy policies.</p>
      </div>
    ),
  },
  {
    id: "data-security",
    icon: Lock,
    title: "Data Security",
    content: (
      <p className="text-white/60 text-sm leading-relaxed">
        We take reasonable technical and organisational measures to protect your information against:
        unauthorised access, data loss, misuse, alteration, and disclosure. While we strive to keep your information secure, no online system can guarantee absolute security.
      </p>
    ),
  },
  {
    id: "your-rights",
    icon: Shield,
    title: "Your Rights",
    content: (
      <div className="space-y-4 text-white/60 text-sm leading-relaxed">
        <p>Depending on your location, you may have the right to:</p>
        <ul className="space-y-1.5 list-disc list-inside ml-2">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent</li>
          <li>Restrict processing</li>
          <li>Request a copy of your information</li>
          <li>Object to certain processing activities</li>
        </ul>
        <p>To exercise these rights, please contact us.</p>
      </div>
    ),
  },
  {
    id: "data-retention",
    icon: Database,
    title: "Data Retention",
    content: (
      <p className="text-white/60 text-sm leading-relaxed">
        We only keep your information for as long as necessary to: provide our services, meet legal obligations, resolve disputes, and maintain business records.
      </p>
    ),
  },
  {
    id: "external-links",
    icon: ExternalLink,
    title: "External Links",
    content: (
      <p className="text-white/60 text-sm leading-relaxed">
        Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of external websites.
      </p>
    ),
  },
  {
    id: "updates",
    icon: FileText,
    title: "Updates to This Policy",
    content: (
      <p className="text-white/60 text-sm leading-relaxed">
        We may update this Privacy Policy from time to time. Any changes will be published on this page with an updated revision date.
      </p>
    ),
  },
];

// ============================================================
// MAIN PAGE
// ============================================================

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <GradientBackground />
      <Navigation />

      <section className="relative z-10 py-20 sm:py-24 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* Header */}
          <GlassCard featured className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Shield size={28} className="text-[#00b8fd]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Privacy Policy</h1>
                <p className="text-white/50 text-sm">
                  Last Updated: August 2026
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              At <strong>Webistic Marketing Solutions</strong> (&quot;Webistic&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we value your privacy and are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your personal data.
            </p>
            <p className="text-white/60 text-sm mt-3">
              By using our website, you agree to the practices described in this Privacy Policy.
            </p>
          </GlassCard>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <GlassCard key={index}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={18} className="text-[#00b8fd]" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-white font-semibold text-lg mb-2">{section.title}</h2>
                      {section.content}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Contact */}
          <GlassCard featured className="mt-8">
            <h2 className="text-white font-semibold text-lg mb-3">Contact Us</h2>
            <p className="text-white/70 text-sm mb-3">
              If you have any questions regarding this Privacy Policy, please contact us:
            </p>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/80 text-sm"><strong>Webistic Marketing Solutions</strong></p>
              <p className="text-white/60 text-sm mt-1">
                Email: <a href={`mailto:${BRAND.email}`} className="text-[#00b8fd] hover:underline">{BRAND.email}</a>
              </p>
              <p className="text-white/60 text-sm">
                WhatsApp: <a href={`https://wa.me/${BRAND.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-[#00b8fd] hover:underline">{BRAND.whatsapp}</a>
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}
