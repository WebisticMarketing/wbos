"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MessageCircle,
  X,
  Send,
  Zap,
  ArrowRight,
  Minimize2,
  Plus,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface LeadData {
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  service: string | null;
  goal: string | null;
}

interface APIResponse {
  reply: string;
  lead: LeadData;
  collecting: boolean;
  nextField: string | null;
  complete: boolean;
  error?: boolean;
  conversationId?: string;
}

// ============================================================
// CHATBOT COMPONENT
// ============================================================

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAutoPopup, setShowAutoPopup] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [leadSent, setLeadSent] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [nextField, setNextField] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // SESSION ID
  // ============================================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      let existing = localStorage.getItem("webistic-chat-session");
      if (!existing) {
        existing = crypto.randomUUID();
        localStorage.setItem("webistic-chat-session", existing);
      }
      setSessionId(existing);
    }
  }, []);

  // ============================================================
  // LOAD FROM LOCALSTORAGE
  // ============================================================

  useEffect(() => {
    setMounted(true);
    
    const saved = localStorage.getItem("webistic-chat-messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          setConversationStarted(true);
        }
      } catch (e) {
        console.error("Failed to load messages", e);
      }
    }
  }, []);

  // ============================================================
  // SAVE TO LOCALSTORAGE
  // ============================================================

  useEffect(() => {
    if (messages.length > 0 && mounted) {
      localStorage.setItem("webistic-chat-messages", JSON.stringify(messages));
    }
  }, [messages, mounted]);

  // ============================================================
  // SCROLL TO BOTTOM
  // ============================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (mounted) {
      scrollToBottom();
    }
  }, [messages, mounted]);

  // ============================================================
  // AUTO POPUP
  // ============================================================

  useEffect(() => {
    if (!mounted) return;

    const hasDismissed = localStorage.getItem("chatbot-dismissed");
    
    const timer = setTimeout(() => {
      if (!isOpen && !hasDismissed && messages.length === 0) {
        setShowAutoPopup(true);
      }
    }, 25000);

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrolled / height) * 100;

      if (scrollPercentage > 50 && !isOpen && !hasDismissed && messages.length === 0) {
        setShowAutoPopup(true);
      }
    };

    const handleExitIntent = (e: MouseEvent) => {
      if (e.clientY < 10 && !isOpen && !hasDismissed && messages.length === 0) {
        setShowAutoPopup(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mouseleave", handleExitIntent);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleExitIntent);
    };
  }, [isOpen, mounted, messages.length]);

  // ============================================================
  // START NEW CHAT
  // ============================================================

  const startNewChat = () => {
    setMessages([]);
    setConversationStarted(false);
    setLeadSent(false);
    setIsCollecting(false);
    setNextField(null);
    
    localStorage.removeItem("webistic-chat-messages");
    localStorage.removeItem("webistic-chat-session");
    
    const newSessionId = crypto.randomUUID();
    localStorage.setItem("webistic-chat-session", newSessionId);
    setSessionId(newSessionId);
    
    setTimeout(() => {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "👋 New chat started! I'm Webistic AI. How can I help you grow your business today?",
        },
      ]);
      setConversationStarted(true);
    }, 300);
  };

  // ============================================================
  // SEND MESSAGE TO API
  // ============================================================

  const sendMessageToAPI = async (userMessage: string) => {
    setIsLoading(true);

    try {
      const apiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      apiMessages.push({ role: "user", content: userMessage });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply,
        },
      ]);

      setIsCollecting(data.collecting || false);
      setNextField(data.nextField || null);

      if (data.complete) {
        setLeadSent(true);
        setIsCollecting(false);
        setNextField(null);
      }

      if (data.conversationId && !sessionId) {
        setSessionId(data.conversationId);
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error("Chat error:", error);
      setIsLoading(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again or contact us directly at info@webistic.co",
        },
      ]);
    }
  };

  // ============================================================
  // HANDLE SEND
  // ============================================================

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: text },
    ]);
    setInputValue("");

    await sendMessageToAPI(text);
  };

  // ============================================================
  // START CONVERSATION
  // ============================================================

  const startConversation = () => {
    setIsOpen(true);
    setShowAutoPopup(false);
    localStorage.setItem("chatbot-dismissed", "true");

    if (!conversationStarted && messages.length === 0) {
      setConversationStarted(true);
      
      setTimeout(() => {
        setMessages([
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Hey! I'm Webistic AI. I help businesses grow online. What can I help you with today?",
          },
        ]);
      }, 500);
    }
  };

  const dismissAutoPopup = () => {
    setShowAutoPopup(false);
    localStorage.setItem("chatbot-dismissed", "true");
  };

  const toggleChat = () => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      startConversation();
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setShowAutoPopup(false);
  };

  // ============================================================
  // SUGGESTED QUESTIONS
  // ============================================================

  const suggestedQuestions = [
    "What services do you offer?",
    "How much does a website cost?",
    "What is SEO?",
    "How long does it take?",
    "I want to book a package",
  ];

  // ============================================================
  // RENDER
  // ============================================================

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Auto Popup */}
      <AnimatePresence>
        {showAutoPopup && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-[9998] max-w-sm w-[calc(100%-2rem)] sm:w-full"
          >
            <div className="relative rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl shadow-[#0068e3]/10 p-4">
              <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

              <button
                onClick={dismissAutoPopup}
                className="absolute top-2 right-2 text-white/30 hover:text-white/60 transition-colors duration-200"
                aria-label="Dismiss popup"
              >
                <X size={16} aria-hidden="true" />
              </button>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center flex-shrink-0">
                  <Zap size={18} className="text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-white font-semibold text-sm">
                    Need help with your business growth?
                  </h4>
                  <p className="text-white/60 text-xs mt-1">
                    Ask our AI consultant anything about Webistic's services.
                  </p>
                  <button
                    onClick={startConversation}
                    className="mt-2 text-xs font-medium text-[#00b8fd] hover:text-white transition-colors duration-200 flex items-center gap-1"
                    aria-label="Open chat"
                  >
                    Chat Now <ArrowRight size={12} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!isOpen && !showAutoPopup && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startConversation}
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[9999] group"
          aria-label="Open AI Chatbot"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#00b8fd]/30 blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white p-3 sm:p-4 rounded-full shadow-2xl shadow-[#0068e3]/30 flex items-center gap-2">
              <Zap size={20} className="text-white" aria-hidden="true" />
              <span className="text-sm font-medium">
                Ask Our AI
              </span>
            </div>
          </div>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[9999] ${
              isMinimized ? "w-auto" : "w-[calc(100%-2rem)] sm:w-[420px]"
            }`}
          >
            {isMinimized ? (
              <button
                onClick={() => setIsMinimized(false)}
                className="bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white px-5 py-3 rounded-2xl shadow-2xl shadow-[#0068e3]/30 flex items-center gap-2"
                aria-label="Expand AI Chatbot"
              >
                <MessageCircle size={18} aria-hidden="true" />
                <span className="text-sm font-medium">Webistic AI</span>
                {messages.length > 0 && (
                  <span className="text-white/60 text-xs ml-1">— {messages.length} messages</span>
                )}
              </button>
            ) : (
              <div className="relative rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl shadow-[#0068e3]/10 overflow-hidden max-h-[600px] flex flex-col">
                <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0 bg-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#00b8fd]/30 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center">
                      <Image
                        src="/webistic-ai.png"
                        alt="Webistic AI"
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('span');
                            fallback.className = 'text-white text-lg font-bold';
                            fallback.textContent = 'W';
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate">
                        Webistic AI
                      </h3>
                      <p className="text-white/40 text-xs truncate">Digital Growth Consultant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={startNewChat}
                      className="text-white/40 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/10"
                      aria-label="Start new chat"
                    >
                      <Plus size={18} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="text-white/60 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/10"
                      aria-label="Minimize chat"
                    >
                      <Minimize2 size={18} aria-hidden="true" />
                    </button>
                    <button
                      onClick={closeChat}
                      className="text-white/60 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/10"
                      aria-label="Close chat"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-[#00b8fd]/30 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center">
                        <Image
                          src="/webistic-ai.png"
                          alt="Webistic AI"
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.className = 'w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-[#00b8fd]/30 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center';
                              const fallback = document.createElement('span');
                              fallback.className = 'text-white text-3xl font-bold';
                              fallback.textContent = 'W';
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      </div>
                      <h4 className="text-white font-semibold text-lg">Webistic AI</h4>
                      <p className="text-white/50 text-sm mt-2 max-w-xs">
                        Your digital growth consultant. Ask me anything about growing your business online.
                      </p>
                      <button
                        onClick={startConversation}
                        className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white text-sm font-medium hover:from-[#0052b3] hover:to-[#0068e3] transition-all duration-200"
                        aria-label="Start a conversation"
                      >
                        Start a Conversation
                      </button>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        } items-start`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-1 border border-[#00b8fd]/20 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center">
                            <Image
                              src="/webistic-ai.png"
                              alt="Webistic AI"
                              width={28}
                              height={28}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.className = 'w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-1 border border-[#00b8fd]/20 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center';
                                  const fallback = document.createElement('span');
                                  fallback.className = 'text-white text-xs font-bold';
                                  fallback.textContent = 'W';
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                            msg.role === "user"
                              ? "bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white rounded-tr-none"
                              : "bg-white/10 text-white/90 rounded-tl-none border border-white/10"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}

                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-[#00b8fd]/20 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center">
                        <Image
                          src="/webistic-ai.png"
                          alt="Webistic AI"
                          width={28}
                          height={28}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.className = 'w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-[#00b8fd]/20 bg-gradient-to-r from-[#0068e3] to-[#00b8fd] flex items-center justify-center';
                              const fallback = document.createElement('span');
                              fallback.className = 'text-white text-xs font-bold';
                              fallback.textContent = 'W';
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      </div>
                      <div className="bg-white/10 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length > 0 && messages.length < 6 && !isLoading && (
                  <div className="flex flex-wrap gap-1.5 p-3 border-t border-white/10 flex-shrink-0 max-h-[100px] overflow-y-auto">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInputValue(q);
                          setTimeout(() => handleSend(), 100);
                        }}
                        className="px-3 py-1.5 text-xs rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10 transition-all duration-200 whitespace-nowrap"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-white/10 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={isCollecting && nextField ? `Please enter your ${nextField}...` : "Ask me anything..."}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:border-[#00b8fd] focus:outline-none transition-colors duration-200 text-sm min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={isCollecting && nextField ? `Please enter your ${nextField}` : "Ask me anything"}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isLoading}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-[#0068e3] to-[#00b8fd] text-white hover:from-[#0052b3] hover:to-[#0068e3] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      aria-label="Send message"
                    >
                      <Send size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}