"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Menu,
  Phone,
  Sparkles,
  Clock,
  DollarSign,
  RefreshCw,
  Globe,
  Scale,
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
// TERMS CONTENT
// ============================================================

const sections = [
  {
    icon: FileText,
    title: "Services",
    content: (
      <div className="space-y-3 text-white/60 text-sm leading-relaxed">
        <p>We provide professional digital services including:</p>
        <div className="flex flex-wrap gap-2">
          {["Website Design & Development", "SEO", "Google Ads Management", "Social Media Management", "Website Maintenance", "Branding & Graphic Design"].map((service, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs">{service}</span>
          ))}
        </div>
        <p className="text-white/50 text-xs">Service availability may change without notice.</p>
      </div>
    ),
  },
  {
    icon: DollarSign,
    title: "Quotes & Pricing",
    content: (
      <ul className="space-y-2 text-white/60 text-sm leading-relaxed list-disc list-inside ml-2">
        <li>All quotations are provided based on the project requirements shared with us.</li>
        <li>Additional work requested after approval may incur additional charges.</li>
        <li>Prices displayed on our website are subject to change without prior notice.</li>
      </ul>
    ),
  },
  {
    icon: CheckCircle,
    title: "Payments",
    content: (
      <ul className="space-y-2 text-white/60 text-sm leading-relaxed list-disc list-inside ml-2">
        <li>Payment terms will be agreed before work begins.</li>
        <li>Projects may require an upfront deposit before work starts.</li>
        <li>Monthly services are billed in advance unless agreed otherwise.</li>
        <li>Late payments may delay ongoing work or service delivery.</li>
      </ul>
    ),
  },
  {
    icon: Shield,
    title: "Client Responsibilities",
    content: (
      <ul className="space-y-2 text-white/60 text-sm leading-relaxed list-disc list-inside ml-2">
        <li>Provide accurate information</li>
        <li>Required content</li>
        <li>Images and branding assets</li>
        <li>Timely feedback</li>
        <li>Necessary account access</li>
      </ul>
    ),
  },
  {
    icon: Clock,
    title: "Project Timelines",
    content: (
      <ul className="space-y-2 text-white/60 text-sm leading-relaxed list-disc list-inside ml-2">
        <li>Estimated delivery times are provided before work begins.</li>
        <li>Delivery schedules may change if project requirements change, required content is delayed, client approvals are delayed, or third-party services cause delays.</li>
      </ul>
    ),
  },
  {
    icon: RefreshCw,
    title: "Revisions",
    content: (
      <p className="text-white/60 text-sm leading-relaxed">
        Website and design packages include the revisions specified in the selected package. Additional revisions beyond the included amount may incur additional charges.
      </p>
    ),
  },
  {
    icon: Scale,
    title: "Intellectual Property",
    content: (
      <ul className="space-y-2 text-white/60 text-sm leading-relaxed list-disc list-inside ml-2">
        <li>Clients own the final approved work after full payment.</li>
        <li>Webistic retains the right to showcase completed projects within our portfolio unless confidentiality has been agreed in writing.</li>
        <li>Third-party software, plugins, themes, fonts, and licensed assets remain subject to their respective licences.</li>
      </ul>
    ),
  },
  {
    icon: Shield,
    title: "Website Maintenance",
    content: (
      <p className="text-white/60 text-sm leading-relaxed">
        Website maintenance covers the services included within the selected maintenance plan. Major redesigns, additional functionality, or new pages are quoted separately.
      </p>
    ),
  },
  {
    icon: AlertCircle,
    title: "SEO & Marketing Disclaimer",
    content: (
      <div className="space-y-3 text-white/60 text-sm leading-relaxed">
        <p>While we follow industry best practices to improve rankings, traffic, and advertising performance, we cannot guarantee:</p>
        <ul className="space-y-1.5 list-disc list-inside ml-2">
          <li>First-page Google rankings</li>
          <li>Specific traffic increases</li>
          <li>Sales or revenue</li>
          <li>Lead volume</li>
          <li>Advertising performance</li>
        </ul>
        <p className="text-white/50 text-xs">Results depend on competition, market conditions, website quality, and many external factors beyond our control.</p>
      </div>
    ),
  },
  {
    icon: Scale,
    title: "Limitation of Liability",
    content: (
      <p className="text-white/60 text-sm leading-relaxed">
        To the fullest extent permitted by law, Webistic Marketing Solutions shall not be liable for any indirect, incidental, consequential, or business losses arising from the use of our website or services.
      </p>
    ),
  },
  {
    icon: X,
    title: "Cancellation",
    content: (
      <ul className="space-y-2 text-white/60 text-sm leading-relaxed list-disc list-inside ml-2">
        <li>Monthly services may be cancelled according to the agreed notice period.</li>
        <li>Any completed work remains payable.</li>
      </ul>
    ),
  },
  {
    icon: Globe,
    title: "Website Availability & Governing Law",
    content: (
      <div className="space-y-3 text-white/60 text-sm leading-relaxed">
        <p><strong>Website Availability:</strong> We aim to keep our website available at all times but cannot guarantee uninterrupted access due to maintenance, updates, or circumstances beyond our control.</p>
        <p><strong>Governing Law:</strong> These Terms &amp; Conditions shall be governed by and interpreted in accordance with the laws of England and Wales.</p>
      </div>
    ),
  },
  {
    icon: FileText,
    title: "Changes to These Terms",
    content: (
      <p className="text-white/60 text-sm leading-relaxed">
        We may update these Terms &amp; Conditions at any time. Continued use of our website constitutes acceptance of the revised terms.
      </p>
    ),
  },
];

// ============================================================
// MAIN PAGE
// ============================================================

export default function TermsPage() {
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
                <FileText size={28} className="text-[#00b8fd]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Terms &amp; Conditions</h1>
                <p className="text-white/50 text-sm">
                  Last Updated: August 2026
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Welcome to Webistic Marketing Solutions. By accessing our website or using our services, you agree to these Terms &amp; Conditions.
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
            <h2 className="text-white font-semibold text-lg mb-3">Contact</h2>
            <p className="text-white/70 text-sm mb-3">
              If you have any questions about these Terms &amp; Conditions, please contact:
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
