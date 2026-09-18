import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  callDate?: string
  callTime?: string
  timezone?: string
  topic?: string
}

const Email = ({ name, callDate, callTime, timezone, topic }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your discovery call is tomorrow</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Your call is tomorrow</Heading>
        <Text style={text}>
          {name ? `Hi ${name},` : 'Hi there,'} this is a quick reminder about your free
          15-minute discovery call with Modern Nostalgia Club.
        </Text>

        <Section style={panel}>
          <Text style={row}>
            <strong>When:</strong> {callDate || 'Tomorrow'}
            {callTime ? ` at ${callTime} Pacific` : ''}
          </Text>
          {timezone ? (
            <Text style={row}>
              <strong>Your timezone:</strong> {timezone}
            </Text>
          ) : null}
          {topic ? (
            <Text style={row}>
              <strong>Topic:</strong> {topic}
            </Text>
          ) : null}
        </Section>

        <Text style={text}>
          We will email you the meeting link before the call. Bring links to your catalog and
          any questions about splits, ownership or sync readiness.
        </Text>

        <Hr style={hr} />
        <Text style={muted}>
          Need to move the time? Just reply to this email and we will sort it out.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Reminder: your discovery call is tomorrow',
  displayName: 'Discovery call reminder',
  previewData: {
    name: 'Jordan',
    callDate: 'Tuesday, March 4',
    callTime: '10:00 AM',
    timezone: 'America/Los_Angeles',
    topic: 'Sync licensing strategy',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const heading = { fontSize: '26px', fontWeight: 700, color: '#111111', margin: '0 0 16px' }
const text = { fontSize: '15px', lineHeight: '24px', color: '#333333' }
const panel = {
  backgroundColor: '#f5f6f8',
  borderRadius: '10px',
  padding: '16px 20px',
  margin: '20px 0',
}
const row = { fontSize: '15px', lineHeight: '22px', color: '#111111', margin: '6px 0' }
const hr = { borderColor: '#e6e6e6', margin: '26px 0 16px' }
const muted = { fontSize: '13px', lineHeight: '20px', color: '#666666' }
