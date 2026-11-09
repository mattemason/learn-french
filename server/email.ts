/**
 * Transactional email for verification codes.
 *
 * Configure ONE provider via Railway variables:
 *   POSTMARK_SERVER_TOKEN   (Postmark)  — or —
 *   RESEND_API_KEY          (Resend)
 * plus EMAIL_FROM, e.g. "Allez ! <learn@emason.com.au>" (a verified sender/domain).
 *
 * With no provider configured, codes are written to the server log so
 * registration still works in development (and is visible to the admin).
 */
const postmark = process.env.POSTMARK_SERVER_TOKEN;
const resend = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || 'Allez ! <no-reply@emason.com.au>';

export const emailProvider = postmark ? 'postmark' : resend ? 'resend' : 'log';

interface Mail { to: string; subject: string; text: string; html: string }

export async function sendMail(m: Mail): Promise<void> {
  if (postmark) {
    const res = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Postmark-Server-Token': postmark },
      body: JSON.stringify({ From: from, To: m.to, Subject: m.subject, TextBody: m.text, HtmlBody: m.html, MessageStream: 'outbound' }),
    });
    if (!res.ok) throw new Error(`Postmark error ${res.status}: ${await res.text()}`);
    return;
  }
  if (resend) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resend}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [m.to], subject: m.subject, text: m.text, html: m.html }),
    });
    if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
    return;
  }
  console.log(`[email:log] To ${m.to} — ${m.subject}\n${m.text}`);
}

export function codeEmail(code: string, purpose: 'signup' | 'reset'): Omit<Mail, 'to'> {
  const action = purpose === 'signup' ? 'finish creating your account' : 'reset your password';
  const subject = purpose === 'signup' ? `${code} is your Allez ! verification code` : `${code} is your Allez ! password reset code`;
  const text = `Bonjour !\n\nYour code is: ${code}\n\nEnter it in the app to ${action}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.\n\n— Allez !`;
  const html = `<!doctype html><html><body style="margin:0;background:#fff6f8;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#2d1838">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
    <table width="100%" style="max-width:440px;background:#ffffff;border-radius:24px;border:1px solid #f2d6e1" cellpadding="0" cellspacing="0">
      <tr><td style="padding:32px 28px">
        <div style="font-family:Georgia,serif;font-style:italic;font-weight:700;font-size:26px;color:#e93c70">Allez&nbsp;!</div>
        <p style="font-size:16px;line-height:1.5;margin:20px 0 8px">Bonjour ! Enter this code in the app to ${action}:</p>
        <div style="font-size:36px;font-weight:800;letter-spacing:10px;background:#fdebf1;border-radius:16px;padding:16px 0;text-align:center;margin:16px 0">${code}</div>
        <p style="font-size:14px;color:#786280;line-height:1.5;margin:0">It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
  return { subject, text, html };
}
