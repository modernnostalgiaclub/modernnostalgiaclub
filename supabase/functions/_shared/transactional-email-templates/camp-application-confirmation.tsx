import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  campName?: string
}

const Email = ({ name = 'there', campName = 'songwriting camp' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`We received your ${campName} application`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>MODERN NOSTALGIA CLUB</Text>
        <Heading style={heading}>Your application is in</Heading>
        <Text style={copy}>Hi {name},</Text>
        <Text style={copy}>
          Thanks for applying to the {campName}. We are building a real home for Filipino artists, producers and
          instrumentalists, and we are glad you raised your hand.
        </Text>
        <Text style={copy}>
          We review every application personally. If it is a fit, we will email you with next steps and camp details.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Questions? Just reply to this email.</Text>
        <Text style={footer}>Ge Oh, Modern Nostalgia Club</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => `We received your ${data?.campName || 'camp'} application`,
  displayName: 'Camp application confirmation',
  previewData: { name: 'Jane', campName: 'Sync Compilation Album Camp' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '28px 28px 40px', maxWidth: '560px' }
const kicker = { fontSize: '11px', letterSpacing: '2px', color: '#1194ff', margin: '0 0 6px', fontWeight: 700 }
const heading = { fontSize: '26px', color: '#111111', margin: '0 0 16px', fontWeight: 700 }
const copy = { fontSize: '15px', color: '#333333', lineHeight: '24px', margin: '0 0 14px' }
const hr = { borderColor: '#eeeeee', margin: '20px 0' }
const footer = { fontSize: '13px', color: '#777777', margin: '0 0 4px' }
