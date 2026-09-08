// app/lib/knowledge.ts

export const COMPANY_INFO = {
  name: "Webistic Marketing Solutions",
  tagline: "Helping Businesses Grow Online.",
  location: "United Kingdom",
  email: "info@webistic.co",
  whatsapp: "+44 7353 142633",
  website: "https://webistic.co",
  founded: 2024,
  responseTime: "within 2-4 hours during business hours",
};

export const TEAM = [
  {
    name: "Awais Khan",
    role: "Chief Executive Officer",
    expertise: ["Business Strategy", "Growth", "Leadership"],
  },
  {
    name: "Ali Khan",
    role: "Sales & Lead Generation Specialist",
    expertise: ["Google Ads", "Lead Generation", "Client Acquisition"],
  },
  {
    name: "Mukarram Khan",
    role: "Social Media Manager",
    expertise: ["Social Media", "Branding", "Content"],
  },
  {
    name: "Abdullah Reyan",
    role: "Web and App Developer",
    expertise: ["Web Apps", "Mobile Apps", "React", "UI Development"],
  },
];

export const SERVICES = {
  website: {
    name: "Website Design",
    packages: {
      launch: { name: "Launch", price: 499, pages: 3, domain: "1 Year", hosting: "1 Year" },
      growth: { name: "Growth", price: 799, pages: 5, domain: "2 Years", hosting: "2 Years" },
      pro: { name: "Pro", price: 999, pages: 10, domain: "3 Years", hosting: "3 Years" },
    },
  },
  app: {
    name: "App Development",
    packages: {
      starter: { name: "App Starter", price: 1499, screens: 5, support: "1 Month" },
      pro: { name: "App Pro", price: 1999, screens: 15, support: "3 Months" },
    },
  },
  website_care: {
    name: "Website Care",
    monthly: 30,
    yearly: 300,
    description: "Peace of mind that your website is safe, fast, and always working.",
    note: "Available exclusively for websites developed by Webistic",
  },
  growth_bundle: {
    name: "Webistic Growth Bundle",
    price: 350,
    description: "SEO + Social Media Management together",
    savings: "Save £50/month",
  },
  seo: { name: "SEO", price: 250, description: "Get found on Google" },
  google_ads: { name: "Google Ads", price: 200, description: "Drive immediate leads" },
  social_media: { name: "Social Media", price: 150, description: "Build your audience" },
  logo: { name: "Logo Design", price: 49, description: "Professional logo design" },
};

export const PROCESS = [
  { step: 1, title: "Discovery", desc: "We understand your business, goals, and target audience." },
  { step: 2, title: "Strategy", desc: "We develop a tailored growth strategy for your business." },
  { step: 3, title: "Design & Build", desc: "We create a modern, high-performance digital solution." },
  { step: 4, title: "Launch & Grow", desc: "We launch, monitor, and continuously optimize for results." },
];

export const TIMELINE = {
  website: "5-14 business days",
  seo: "2-3 months for results",
  google_ads: "Immediate traffic",
  app: "4-8 weeks",
  logo: "3-5 business days",
};

export const INDUSTRIES = [
  "Driving Schools",
  "Minibus Hire",
  "Barbers & Salons",
  "Dentists",
  "Restaurants",
  "Estate Agents",
  "Trades",
  "Small Businesses",
];

export const VALUES = [
  "Strategic Thinking",
  "Innovation",
  "Partnership",
  "Excellence",
];

export const MISSION = "To make modern digital growth accessible to businesses of every size by combining strategy, innovation, and support.";