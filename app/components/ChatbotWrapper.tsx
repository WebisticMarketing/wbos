"use client";

import { usePathname } from "next/navigation";
import Chatbot from "./chatbot";
import CookieConsent from "./CookieConsent";

export default function ChatbotWrapper() {
  const pathname = usePathname();

  // Hide chatbot on admin and WBOS pages
  const isAdmin = pathname?.startsWith("/admin");
  const isWbos = pathname?.startsWith("/wbos");

  if (isAdmin || isWbos) {
    return null;
  }

  return (
    <>
      <Chatbot />
      <CookieConsent />
    </>
  );
}