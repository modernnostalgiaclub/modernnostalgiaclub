import {
  sendTemplateEmail,
  type SendTemplateEmailOptions,
  type SendTemplateEmailResult,
} from './transactional-email-templates/send-email.ts'

/**
 * Sends a registered template through Lovable's managed email API and records
 * the outcome in the project's email_send_log audit table.
 *
 * Delivery, retries, rate limits, suppression and unsubscribe are handled by
 * Lovable — this only mirrors the result into the app's own log table.
 */
export async function sendAndLogEmail(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {}
): Promise<SendTemplateEmailResult> {
  try {
    const result = await sendTemplateEmail(templateName, to, options)

    const { error } = await supabase.from('email_send_log').insert({
      message_id: null,
      template_name: templateName,
      recipient_email: to,
      status: result.sent ? 'sent' : 'suppressed',
      error_message: result.sent
        ? null
        : 'Recipient suppressed (bounce, complaint or unsubscribe)',
    })
    if (error) {
      console.error('Failed to write email_send_log row', {
        code: error.code,
        message: error.message,
        template_name: templateName,
      })
    }

    return result
  } catch (sendError) {
    const message =
      sendError instanceof Error ? sendError.message : String(sendError)

    const { error } = await supabase.from('email_send_log').insert({
      message_id: null,
      template_name: templateName,
      recipient_email: to,
      status: 'failed',
      error_message: message.slice(0, 1000),
    })
    if (error) {
      console.error('Failed to write email_send_log row', {
        code: error.code,
        message: error.message,
        template_name: templateName,
      })
    }

    throw sendError
  }
}
