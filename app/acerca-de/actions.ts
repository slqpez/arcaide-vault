"use server";

import { Resend } from "resend";

export type ContactMessage = {
  name: string;
  email: string;
  msg: string;
};

export type SendContactMessageResult = { ok: true } | { ok: false; error: string };

export async function sendContactMessage(message: ContactMessage): Promise<SendContactMessageResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    return { ok: false, error: "El servicio de correo no está configurado." };
  }

  if (!message.name.trim() || !message.email.trim() || !message.msg.trim()) {
    return { ok: false, error: "Faltan campos por completar." };
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Arcade Vault <onboarding@resend.dev>",
    to,
    replyTo: message.email.trim(),
    subject: `Nuevo mensaje de contacto de ${message.name.trim()}`,
    text: `De: ${message.name.trim()} <${message.email.trim()}>\n\n${message.msg.trim()}`,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
