/**
 * Contact form handler — runs as a Vercel serverless function.
 * Env vars (set in Vercel, never in the repo): RESEND_API_KEY, CONTACT_TO, CONTACT_FROM.
 */
import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const get = (k: string) => String(form.get(k) ?? "").trim().slice(0, 5000);

  // Bots fill the hidden honeypot field; pretend success and drop it.
  if (get("honeypot")) return json(200, { ok: true });

  const data = {
    name: get("your_name"),
    email: get("email_address"),
    phone: get("telephone_number"),
    business: get("business_name"),
    message: get("brief_outline_of_your_enquiry"),
  };
  if (!data.name || !data.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return json(400, { error: "Please add your name, a valid email and a short message." });
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = import.meta.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    console.error("Contact form is not configured: missing env vars");
    return json(500, { error: "The form isn't set up yet." });
  }

  const rows = Object.entries(data).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0"><b>${k}</b></td><td>${esc(v || "—").replace(/\n/g, "<br>")}</td></tr>`).join("");
  const { error } = await new Resend(RESEND_API_KEY).emails.send({
    from: CONTACT_FROM,
    to: CONTACT_TO.split(",").map((s: string) => s.trim()),
    replyTo: data.email,
    subject: `New enquiry from ${data.name}${data.business ? ` (${data.business})` : ""}`,
    html: `<table>${rows}</table>`,
  });
  if (error) {
    console.error("Resend error", error);
    return json(502, { error: "Sorry, your message couldn't be sent." });
  }
  return json(200, { ok: true });
};
