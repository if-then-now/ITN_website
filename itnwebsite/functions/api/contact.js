/**
 * POST /api/contact — contact form handler (Cloudflare Pages Function).
 *
 * Replaces Netlify Forms. Validates the submission, silently drops anything
 * that trips the honeypot, and emails the rest via Resend.
 *
 * Set these in the Cloudflare Pages dashboard under
 * Settings -> Environment variables (Production and Preview):
 *
 *   RESEND_API_KEY  required, encrypt it   API key from resend.com
 *   CONTACT_TO      required                where submissions are emailed
 *   CONTACT_FROM    optional                verified sender address; defaults to
 *                                           Resend's onboarding address, which
 *                                           needs no DNS setup to start with
 *   RESEND_ENDPOINT optional, local only    override the API URL so `wrangler
 *                                           pages dev` can be pointed at a mock
 *                                           instead of sending real mail
 *
 * Never commit the API key — it belongs in the dashboard, not the repo.
 */

const MAX_FIELD_LENGTH = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'onboarding@resend.dev';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Submitted text lands in an HTML email, so it has to be escaped going in. */
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function field(form, key) {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Own every method on this route, not just POST. Exporting only onRequestPost
 * lets a GET fall through to the static asset handler, which answers 200 with
 * the homepage HTML — so crawlers would index /api/contact as a duplicate of /.
 */
export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST', 'Content-Type': 'text/plain' },
    });
  }
  return handleSubmission(context);
}

async function handleSubmission({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { error: 'Could not read that submission.' });
  }

  // A real visitor never sees the honeypot field, so anything in it is a bot.
  // Answer 200 rather than an error so the bot cannot learn it was caught.
  if (field(form, 'bot-field') !== '') {
    return json(200, { ok: true });
  }

  const name = field(form, 'name');
  const email = field(form, 'email');
  const message = field(form, 'message');

  if (!email || !message) {
    return json(400, { error: 'Email and message are both required.' });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return json(400, { error: 'That email address does not look right.' });
  }
  if (name.length > MAX_FIELD_LENGTH || email.length > MAX_FIELD_LENGTH || message.length > MAX_FIELD_LENGTH) {
    return json(400, { error: 'That message is too long to send.' });
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
    // Our misconfiguration, not the visitor's mistake — log loudly, and don't
    // imply they did something wrong.
    console.error('contact form: RESEND_API_KEY or CONTACT_TO is not set');
    return json(500, { error: 'The form is not configured yet. Please reach us via LinkedIn.' });
  }

  const sender = name || 'Website visitor';
  let response;
  try {
    response = await fetch(env.RESEND_ENDPOINT || DEFAULT_RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `ifthennow.com contact form <${env.CONTACT_FROM || DEFAULT_FROM}>`,
        to: [env.CONTACT_TO],
        // Replying in your mail client should go to the visitor, not to Resend.
        reply_to: email,
        subject: `Website enquiry from ${sender}`,
        text: `Name: ${name || '(not given)'}\nEmail: ${email}\n\n${message}\n`,
        html:
          `<p><strong>Name:</strong> ${escapeHtml(name || '(not given)')}<br>` +
          `<strong>Email:</strong> ${escapeHtml(email)}</p>` +
          `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    });
  } catch (error) {
    console.error('contact form: could not reach Resend', error);
    return json(502, { error: 'Could not send that just now. Please try again shortly.' });
  }

  if (!response.ok) {
    console.error('contact form: Resend returned', response.status, await response.text());
    return json(502, { error: 'Could not send that just now. Please try again shortly.' });
  }

  return json(200, { ok: true });
}
