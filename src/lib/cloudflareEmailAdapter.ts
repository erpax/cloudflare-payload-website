/**
 * Custom Payload email adapter that sends mail through the Cloudflare
 * Workers `send_email` binding. Replaces `@payloadcms/email-resend`.
 *
 * The `cloudflare:email` module is workerd-only — we import it dynamically
 * so the Node-side payload CLI (`generate:types`, `migrate`) doesn't choke.
 *
 * Destination addresses must be verified in the Cloudflare dashboard
 * (Email > Email Routing > Destination addresses) before delivery succeeds.
 */

import { createMimeMessage } from 'mimetext'
import type { EmailAdapter, SendEmailOptions } from 'payload'

type CloudflareEmailMessage = unknown
type CloudflareSendEmailBinding = {
  send: (message: CloudflareEmailMessage) => Promise<void>
}

export type CloudflareEmailAdapterArgs = {
  binding: CloudflareSendEmailBinding
  defaultFromAddress: string
  defaultFromName: string
}

const toAddressList = (value: SendEmailOptions['to']): string[] => {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) =>
      typeof entry === 'string' ? [entry] : entry.address ? [entry.address] : [],
    )
  }
  return typeof value === 'string' ? [value] : value.address ? [value.address] : []
}

const loadEmailMessageCtor = async (): Promise<
  new (from: string, to: string, raw: string) => CloudflareEmailMessage
> => {
  // Dynamic import keeps `cloudflare:email` out of the Node bundle.
  const mod = (await import(/* webpackIgnore: true */ 'cloudflare:email')) as {
    EmailMessage: new (from: string, to: string, raw: string) => CloudflareEmailMessage
  }
  return mod.EmailMessage
}

export const cloudflareEmailAdapter = (
  args: CloudflareEmailAdapterArgs,
): EmailAdapter<{ messageId: string }> => {
  const { binding, defaultFromAddress, defaultFromName } = args

  return ({ payload }) => ({
    name: 'cloudflare-send-email',
    defaultFromAddress,
    defaultFromName,
    sendEmail: async (message) => {
      const fromAddress =
        typeof message.from === 'string'
          ? message.from
          : (message.from?.address ?? defaultFromAddress)
      const fromName =
        typeof message.from === 'string'
          ? defaultFromName
          : (message.from?.name ?? defaultFromName)

      const recipients = toAddressList(message.to)
      if (recipients.length === 0) {
        payload.logger.warn('[cloudflare-send-email] No recipients on outbound message; skipping.')
        return { messageId: '' }
      }

      const mime = createMimeMessage()
      mime.setSender({ addr: fromAddress, name: fromName })
      mime.setRecipient(recipients)
      if (message.subject) {
        mime.setSubject(message.subject)
      }
      if (typeof message.html === 'string' && message.html.length > 0) {
        mime.addMessage({ contentType: 'text/html', data: message.html })
      }
      if (typeof message.text === 'string' && message.text.length > 0) {
        mime.addMessage({ contentType: 'text/plain', data: message.text })
      }

      try {
        const EmailMessage = await loadEmailMessageCtor()
        await Promise.all(
          recipients.map(async (recipient) => {
            const email = new EmailMessage(fromAddress, recipient, mime.asRaw())
            await binding.send(email)
          }),
        )
      } catch (err: unknown) {
        payload.logger.error({ err, msg: '[cloudflare-send-email] send failed' })
        throw err
      }

      const rawMessageId = mime.headers.get('message-id')
      const messageId = typeof rawMessageId === 'string' ? rawMessageId : ''
      return { messageId }
    },
  })
}
