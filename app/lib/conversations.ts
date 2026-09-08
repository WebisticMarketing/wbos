// app/lib/conversations.ts
import { prisma } from "./prisma";

export interface LeadData {
  name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  service?: string | null;
  goal?: string | null;
  business?: string | null;
}

export async function getOrCreateConversation(sessionId: string) {
  let conversation = await prisma.conversation.findUnique({
    where: { sessionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      lead: true,
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        sessionId,
        messages: {
          create: [
            {
              role: "system",
              content: "Conversation started",
            },
          ],
        },
      },
      include: {
        messages: true,
        lead: true,
      },
    });
  }

  return conversation;
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string
) {
  return prisma.message.create({
    data: {
      conversationId,
      role,
      content,
    },
  });
}

export async function updateLead(conversationId: string, leadData: LeadData) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { lead: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.lead) {
    return prisma.lead.update({
      where: { id: conversation.lead.id },
      data: {
        name: leadData.name ?? conversation.lead.name,
        email: leadData.email ?? conversation.lead.email,
        whatsapp: leadData.whatsapp ?? conversation.lead.whatsapp,
        service: leadData.service ?? conversation.lead.service,
        goal: leadData.goal ?? conversation.lead.goal,
        business: leadData.business ?? conversation.lead.business,
        updatedAt: new Date(),
      },
    });
  }

  const lead = await prisma.lead.create({
    data: {
      name: leadData.name || null,
      email: leadData.email || null,
      whatsapp: leadData.whatsapp || null,
      service: leadData.service || null,
      goal: leadData.goal || null,
      business: leadData.business || null,
      source: "chatbot",
      status: "new",
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { leadId: lead.id },
  });

  return lead;
}

export async function getConversationHistory(sessionId: string) {
  return prisma.conversation.findUnique({
    where: { sessionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 50,
      },
      lead: true,
    },
  });
}