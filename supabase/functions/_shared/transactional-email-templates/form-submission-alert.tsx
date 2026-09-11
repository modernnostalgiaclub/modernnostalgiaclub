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

interface Field {
  label: string
  value: string
}

interface Props {
  formName?: string
  senderEmail?: string
  submittedAt?: string
  fields?: Field[]
}

const Row = ({ label, value }: Field) => (
  <Section style={row}>
    <Text style={rowLabel}>{label}</Text>
    <Text style={rowValue}>{value}</Text>
  </Section>
)

const Email = ({
  formName = 'Form',
  senderEmail = 'unknown',
  submittedAt = '',
  fields = [],
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New ${formName} submission from ${senderEmail}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>MODERN NOSTALGIA CLUB</Text>
        <Heading style={heading}>New {formName} submission</Heading>
        <Text style={intro}>From {senderEmail}{submittedAt ? ` · ${submittedAt}` : ''}</Text>
        <Hr style={hr} />
        {(fields || []).map((f, i) => (
          <Row key={`${f.label}-${i}`} label={f.label} value={f.value} />
        ))}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New ${data?.formName || 'form'} submission — ${data?.senderEmail || 'unknown'}`,
  displayName: 'Form submission alert',
  to: 'ge@modernnostalgia.club',
  previewData: {
    formName: 'Sponsorship inquiry',
    senderEmail: 'brand@example.com',
    submittedAt: '2026-09-11 10:22 PT',
    fields: [
      { label: 'Name', value: 'Jane Doe' },
      { label: 'Company', value: 'Example Brand' },
      { label: 'Goals', value: 'Sponsor a live event in San Diego.' },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '28px 28px 40px', maxWidth: '560px' }
const kicker = { fontSize: '11px', letterSpacing: '2px', color: '#1194ff', margin: '0 0 6px', fontWeight: 700 }
const heading = { fontSize: '26px', color: '#111111', margin: '0 0 8px', fontWeight: 700 }
const intro = { fontSize: '14px', color: '#555555', margin: '0' }
const hr = { borderColor: '#eeeeee', margin: '20px 0' }
const row = { margin: '0 0 12px' }
const rowLabel = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', color: '#888888', margin: '0 0 2px' }
const rowValue = { fontSize: '15px', color: '#111111', margin: '0', whiteSpace: 'pre-wrap' as const }
