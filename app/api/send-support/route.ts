import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  const body = await req.json()
  const { email, firstName, lastName, subject, message } = body

  try {
    const data = await resend.emails.send({
      from: 'info@bonus-nest.de',
      to: 'info@bonus-nest.de',
      subject: `[Support] ${subject}`,
      html: `
        <p><strong>Von:</strong> ${firstName} ${lastName} (${email})</p>
        <p><strong>Nachricht:</strong></p>
        <p>${message}</p>
      `,
      headers: {
        'Reply-To': email,
      },
    })

    return Response.json({ success: true, data })
  } catch (error) {
    console.error(error)
    return Response.json({ success: false, error })
  }
}
