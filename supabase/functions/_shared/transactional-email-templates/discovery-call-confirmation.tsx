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
  preferredDate?: string
  preferredTime?: string
  alternateDate?: string
  alternateTime?: string
  timezone?: string
  topic?: string
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <Section style={detailRow}>
    <Text style={detailLabel}>{label}</Text>
    <Text style={detailValue}>{value}</Text>
  </Section>
)

const Email = ({
  name = 'there',
  preferredDate = 'Your requested date',
  preferredTime = 'Your requested time',
  alternateDate,
  alternateTime,
  timezone = 'Local timezone',
  topic = 'Discovery call',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your discovery call request</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>MODERN NOSTALGIA CLUB</Text>
        <Heading style={heading}>Your call request is in</Heading>
        <Text style={intro}>Hi {name},</Text>
        <Text style={copy}>
          Thanks for booking a free discovery call. We received your request and will follow up by email to confirm the final time.
        </Text>
        <Section style={details}>
          <Detail label="Topic" value={topic} />
          <Detail label="Preferred time" value={`${preferredDate} at ${preferredTime}`} />
          {alternateDate ? (
            <Detail label="Backup time" value={`${alternateDate} at ${alternateTime || 'time not selected'}`} />
          ) : null}
          <Detail label="Timezone" value={timezone} />
        </Section>
        <Hr style={hr} />
        <Text style={footer}>We look forward to talking with you.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'We received your discovery call request',
  displayName: 'Discovery call confirmation',
  previewData: {
    name: 'Jane',
    preferredDate: 'September 15, 2026',
    preferredTime: '2:00 PM',
    alternateDate: 'September 16, 2026',
    alternateTime: '3:00 PM',
    timezone: 'America/Los_Angeles',
    topic: 'Catalog audit',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px 40px', maxWidth: '560px' }
const kicker = { fontSize: '11px', letterSpacing: '2px', color: '#1194ff', margin: '0 0 8px', fontWeight: 700 }
const heading = { fontSize: '28px', lineHeight: '1.2', color: '#111111', margin: '0 0 22px', fontWeight: 700 }
const intro = { fontSize: '16px', color: '#111111', margin: '0 0 10px', fontWeight: 600 }
const copy = { fontSize: '15px', lineHeight: '1.6', color: '#444444', margin: '0 0 24px' }
const details = { backgroundColor: '#f4f7fa', padding: '20px', borderLeft: '4px solid #1194ff' }
const detailRow = { margin: '0 0 14px' }
const detailLabel = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', color: '#777777', margin: '0 0 3px', fontWeight: 700 }
const detailValue = { fontSize: '15px', color: '#111111', margin: '0' }
const hr = { borderColor: '#eeeeee', margin: '24px 0 18px' }
const footer = { fontSize: '14px', color: '#555555', margin: '0' }