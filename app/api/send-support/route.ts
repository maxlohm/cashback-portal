import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, subject, message } = body;

    const data = await resend.emails.send({
      from: 'Bonus-Nest Support <support@send.bonus-nest.de>', // deine verifizierte FROM-Adresse
      to: 'info@bonus-nest.de', // Zieladresse (IONOS-Postfach)
      subject: `[Supportanfrage] ${subject}`,
      html: `
        <p><strong>Von:</strong> ${firstName} ${lastName} (${email})</p>
        <p><strong>Nachricht:</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
      headers: {
        'Reply-To': email,
      },
    });

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Fehler beim E-Mail-Versand via Resend:', error);
    return Response.json({ success: false, error });
  }
}
