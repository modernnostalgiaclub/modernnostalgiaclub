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
  artistName?: string
  catalogSize?: string
  goals?: string
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <Section style={detailRow}>
    <Text style={detailLabel}>{label}</Text>
    <Text style={detailValue}>{value}</Text>
  </Section>
)

const Email = ({
  name = 'there',
  artistName,
  catalogSize = 'Not provided',
  goals = 'Not provided',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your catalog audit request</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>MODERN NOSTALGIA CLUB</Text>
        <Heading style={heading}>Your catalog audit request is in</Heading>
        <Text style={intro}>Hi {name},</Text>
        <Text style={copy}>
          Thanks for sending over your catalog details. We have everything we need to start your audit once payment is
          complete, and we will email you to schedule the review session.
        </Text>
        <Section style={details}>
          {artistName ? <Detail label="Artist name" value={artistName} /> : null}
          <Detail label="Catalog size" value={catalogSize} />
          <Detail label="What you want from the audit" value={goals} />
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          If anything in your catalog changes before the review, just reply to this email and we will update your notes.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'We received your catalog audit request',
  displayName: 'Catalog audit confirmation',
  previewData: {
    name: 'Jordan',
    artistName: 'Jordan Wave',
    catalogSize: '10 to 25 songs',
    goals: 'Get sync ready before pitching to supervisors',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const kicker = { fontSize: '12px', letterSpacing: '2px', color: '#1194ff', margin: '0 0 8px' }
const heading = { fontSize: '26px', margin: '0 0 16px', color: '#111111' }
const intro = { fontSize: '16px', margin: '0 0 8px', color: '#111111' }
const copy = { fontSize: '15px', lineHeight: '24px', color: '#444444', margin: '0 0 20px' }
const details = { backgroundColor: '#f6f8fa', borderRadius: '10px', padding: '16px 18px' }
const detailRow = { margin: '0 0 10px' }
const detailLabel = { fontSize: '12px', textTransform: 'uppercase' as const, color: '#777777', margin: '0' }
const detailValue = { fontSize: '15px', color: '#111111', margin: '2px 0 0' }
const hr = { borderColor: '#e6e6e6', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#777777', margin: '0' }
