"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Shield, Cookie, Settings } from "lucide-react";
import Link from "next/link";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(consent);
        setPreferences(parsed);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner && !showSettings) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-6 z-[9999] max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl shadow-[#0068e3]/5 p-5 sm:p-6">
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Cookie size={20} className="text-[#00b8fd]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm sm:text-base">
                    🍪 We Value Your Privacy
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm mt-1 leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <button
                      onClick={acceptAll}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-colors duration-200 shadow-lg shadow-[#0068e3]/25"
                    >
                      <Check size={14} />
                      Accept All
                    </button>
                    <button
                      onClick={acceptNecessary}
                      className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors duration-200 border border-white/10"
                    >
                      Accept Necessary
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="inline-flex items-center gap-1.5 text-white/50 hover:text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors duration-200"
                    >
                      <Settings size={14} />
                      Settings
                    </button>
                    <Link
                      href="/privacy-policy"
                      className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200 ml-auto"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </div>

                <button
                  onClick={acceptNecessary}
                  className="text-white/30 hover:text-white/60 transition-colors duration-200 flex-shrink-0 mt-1"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSettings(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Shield size={20} className="text-[#00b8fd]" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">Cookie Settings</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white/30 hover:text-white/60 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-white/50 text-sm leading-relaxed mb-4">
                Manage your cookie preferences below. Necessary cookies are always enabled as they are essential for the website to function properly.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <h4 className="text-white text-sm font-medium">Necessary</h4>
                    <p className="text-white/40 text-xs">Essential for the website to function</p>
                  </div>
                  <span className="text-white/30 text-xs bg-white/10 px-2 py-0.5 rounded-full">Always On</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200">
                  <div>
                    <h4 className="text-white text-sm font-medium">Analytics</h4>
                    <p className="text-white/40 text-xs">Help us understand how you use the site</p>
                  </div>
                  <button
                    onClick={() => togglePreference("analytics")}
                    className={`w-11 h-6 rounded-full transition-all duration-300 ${
                      preferences.analytics
                        ? "bg-gradient-to-r from-[#0068e3] to-[#00b8fd]"
                        : "bg-white/20"
                    } relative`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                        preferences.analytics ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200">
                  <div>
                    <h4 className="text-white text-sm font-medium">Marketing</h4>
                    <p className="text-white/40 text-xs">Personalized ads and promotions</p>
                  </div>
                  <button
                    onClick={() => togglePreference("marketing")}
                    className={`w-11 h-6 rounded-full transition-all duration-300 ${
                      preferences.marketing
                        ? "bg-gradient-to-r from-[#0068e3] to-[#00b8fd]"
                        : "bg-white/20"
                    } relative`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                        preferences.marketing ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200">
                  <div>
                    <h4 className="text-white text-sm font-medium">Preferences</h4>
                    <p className="text-white/40 text-xs">Remember your preferences and settings</p>
                  </div>
                  <button
                    onClick={() => togglePreference("preferences")}
                    className={`w-11 h-6 rounded-full transition-all duration-300 ${
                      preferences.preferences
                        ? "bg-gradient-to-r from-[#0068e3] to-[#00b8fd]"
                        : "bg-white/20"
                    } relative`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                        preferences.preferences ? "right-0.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-4 border-t border-white/10">
                <button
                  onClick={savePreferences}
                  className="flex-1 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-colors duration-200 shadow-lg shadow-[#0068e3]/25"
                >
                  Save Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 border border-white/10"
                >
                  Accept All
                </button>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="/privacy-policy"
                  className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200"
                >
                  Read our Privacy Policy
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
