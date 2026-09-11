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
  purchaseType?: string
  buyerEmail?: string
  items?: string
  amount?: string
  currency?: string
  reference?: string
  purchasedAt?: string
}

const LABELS: Record<string, string> = {
  store: 'Store purchase',
  membership: 'Membership',
  tip: 'Artist tip',
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <Section style={row}>
    <Text style={rowLabel}>{label}</Text>
    <Text style={rowValue}>{value}</Text>
  </Section>
)

const Email = ({
  purchaseType = 'store',
  buyerEmail = 'unknown',
  items = 'Purchase',
  amount = '',
  currency = 'USD',
  reference = '',
  purchasedAt = '',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New ${LABELS[purchaseType] || 'purchase'} from ${buyerEmail}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>MODERN NOSTALGIA CLUB</Text>
        <Heading style={heading}>New purchase</Heading>
        <Text style={intro}>
          {LABELS[purchaseType] || 'Purchase'} completed{amount ? ` for ${currency.toUpperCase()} ${amount}` : ''}.
        </Text>
        <Hr style={hr} />
        <Row label="Buyer email" value={buyerEmail} />
        <Row label="Type" value={LABELS[purchaseType] || purchaseType} />
        <Row label="Items" value={items} />
        {amount ? <Row label="Amount" value={`${currency.toUpperCase()} ${amount}`} /> : null}
        {purchasedAt ? <Row label="Time" value={purchasedAt} /> : null}
        {reference ? <Row label="Reference" value={reference} /> : null}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New ${LABELS[data?.purchaseType] || 'purchase'} — ${data?.buyerEmail || 'buyer'}`,
  displayName: 'Purchase alert',
  to: 'ge@modernnostalgia.club',
  previewData: {
    purchaseType: 'store',
    buyerEmail: 'buyer@example.com',
    items: 'Split Sheet Template x1',
    amount: '25.00',
    currency: 'USD',
    reference: 'cs_test_123',
    purchasedAt: '2026-08-20 08:10 PT',
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
const rowValue = { fontSize: '15px', color: '#111111', margin: '0' }
