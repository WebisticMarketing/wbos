// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "../../lib/prompts";
import {
  getOrCreateConversation,
  saveMessage,
  updateLead,
  getConversationHistory,
} from "../../lib/conversations";
import { prisma } from "@/app/lib/prisma";

// ============================================================
// THREE GROQ API KEYS
// ============================================================

const groqKeys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean);

const MODEL = "groq/compound";

// ============================================================
// CHAT API
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({
        reply: "Hey! I'm Webistic AI. I help businesses grow online. What can I help you with today?",
        lead: { name: null, email: null, whatsapp: null, service: null, goal: null },
        collecting: false,
        nextField: null,
        complete: false,
        error: false,
        conversationId: sessionId || null,
      });
    }

    const conversation = await getOrCreateConversation(sessionId);

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || "";

    await saveMessage(conversation.id, "user", userMessage);

    const history = await getConversationHistory(sessionId);
    const historyMessages = history?.messages || [];

    const messagesForAI: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...historyMessages
        .filter((m: any) => m.role !== "system")
        .map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ];

    // ============================================================
    // FALLBACK CHAIN - Try each Groq key
    // ============================================================

    let lastError: any = null;

    for (let i = 0; i < groqKeys.length; i++) {
      const key = groqKeys[i];
      if (!key) continue;

      try {
        console.log(`🔄 Trying Groq Key ${i + 1}...`);

        const groq = new Groq({ apiKey: key });

        const response = await groq.chat.completions.create({
          model: MODEL,
          messages: messagesForAI,
          temperature: 0.5, // Increased for more natural responses
          max_tokens: 600,
        });

        const content = response.choices[0]?.message?.content || "{}";

        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[0]);
            } catch (e2) {
              parsed = null;
            }
          }
        }

        if (!parsed) {
          const fallbackReply = "Hey! I'm here to help. What would you like to know about Webistic's services?";
          await saveMessage(conversation.id, "assistant", fallbackReply);

          return NextResponse.json({
            reply: fallbackReply,
            lead: { name: null, email: null, whatsapp: null, service: null, goal: null },
            collecting: false,
            nextField: null,
            complete: false,
            error: false,
            conversationId: sessionId,
          });
        }

        let cleanReply = parsed.reply || "Hey! What can I help you with today?";
        cleanReply = cleanReply.replace(/\{[\s\S]*\}/g, "").trim();
        cleanReply = cleanReply.replace(/```[\s\S]*```/g, "").trim();

        const leadData = {
          name: parsed.lead?.name || null,
          email: parsed.lead?.email || null,
          whatsapp: parsed.lead?.whatsapp || null,
          service: parsed.lead?.service || null,
          goal: parsed.lead?.goal || null,
          business: parsed.lead?.business || null,
        };

        if (leadData.name || leadData.email || leadData.whatsapp) {
          await updateLead(conversation.id, leadData);
        }

        await saveMessage(conversation.id, "assistant", cleanReply);

        if (parsed.complete) {
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { status: "completed" },
          });
        }

        console.log(`✅ Groq Key ${i + 1} succeeded!`);

        return NextResponse.json({
          reply: cleanReply,
          lead: leadData,
          collecting: parsed.collecting || false,
          nextField: parsed.nextField || null,
          complete: parsed.complete || false,
          error: false,
          conversationId: sessionId,
        });

      } catch (error: any) {
        console.error(`❌ Groq Key ${i + 1} failed:`, error.message);
        lastError = error;

        if (error.status === 429 || 
            error.message?.includes('rate') || 
            error.message?.includes('limit') ||
            error.message?.includes('Too Many Requests')) {
          console.log(`⏳ Groq Key ${i + 1} rate limited. Trying next key...`);
          continue;
        }

        continue;
      }
    }

    console.error("❌ All Groq keys failed!");
    console.error("Last error:", lastError?.message || "Unknown error");

    return NextResponse.json({
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
      lead: { name: null, email: null, whatsapp: null, service: null, goal: null },
      collecting: false,
      nextField: null,
      complete: false,
      error: true,
      conversationId: sessionId,
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: "I'm having trouble connecting right now. Please try again.",
      lead: { name: null, email: null, whatsapp: null, service: null, goal: null },
      collecting: false,
      nextField: null,
      complete: false,
      error: true,
      conversationId: null,
    });
  }
}