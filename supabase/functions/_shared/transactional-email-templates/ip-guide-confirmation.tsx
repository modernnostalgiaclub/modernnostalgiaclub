import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const DEFAULT_GUIDE_URL =
  'https://www.modernnostalgia.club/__l5e/assets-v1/67935450-b69e-411d-a668-9a51ed64b27a/Monetizing_Your_IP_The_Artist_Resource_Guide.pdf'
const PATREON_URL = 'https://www.patreon.com/modernnostalgiaclub'
const CONNECT_URL = 'https://www.modernnostalgia.club/connect'

interface Props {
  guideUrl?: string
}

const Email = ({ guideUrl = DEFAULT_GUIDE_URL }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thank you for pulling up — here is your panel breakdown guide.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>MODERN NOSTALGIA CLUB</Text>
        <Heading style={heading}>Peace everyone,</Heading>
        <Text style={body}>
          Thank you for pulling up to "Monetizing your IP as a Fil-Am Musician in the Age of AI"
          and grabbing the panel breakdown guide.
        </Text>
        <Text style={body}>
          If there is one key lesson to take away from our time together, it’s this: your music is
          an asset class most people overlook. The culture is moving globally, and by getting your
          splits locked, your metadata tagged, and your catalog organized, you ensure that the
          capital moves right along with it.
        </Text>

        <Section style={ctaSection}>
          <Button style={button} href={guideUrl}>
            Download the Panel Breakdown PDF
          </Button>
          <Text style={ctaNote}>In case the download didn’t start earlier — this link always works.</Text>
        </Section>

        <Hr style={hr} />

        <Text style={body}>
          If you’re ready to put those checklist steps into daily action, I invite you to join our
          FREE Patreon community. You don't need a paid membership to follow along. By joining the
          free tier, you’ll get:
        </Text>
        <Text style={bullet}>
          <strong>Daily Music Business Advice:</strong> practical breakdowns on catalog auditing,
          pitching, and direct-to-fan monetization.
        </Text>
        <Text style={bullet}>
          <strong>Sync Licensing Opportunities:</strong> direct leads and briefs to get your
          pre-cleared tracks considered for TV, film, and commercial spots.
        </Text>
        <Text style={bullet}>
          <strong>Live Music &amp; Performance Calls:</strong> opportunities to tap into intimate
          shows, pop-ups, and collaborative lineups.
        </Text>

        <Section style={ctaSection}>
          <Button style={button} href={PATREON_URL}>
            Join the FREE Patreon Community
          </Button>
        </Section>

        <Text style={body}>
          Treat your music like a tech startup. Let's keep building, organizing, and securing the
          ownership we deserve.
        </Text>

        <Hr style={hr} />

        <Text style={signoff}>To your growth,</Text>
        <Text style={signature}>Ge Oh</Text>
        <Text style={footer}>
          modernnostalgiaclub LLC
          <br />
          <Link href={CONNECT_URL} style={footerLink}>
            www.modernnostalgia.club/connect
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Thank you for pulling up — your panel breakdown guide inside',
  displayName: 'IP Guide thank-you',
  previewData: {},
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '28px 28px 40px', maxWidth: '560px' }
const kicker = { fontSize: '11px', letterSpacing: '2px', color: '#1194ff', margin: '0 0 6px', fontWeight: 700 }
const heading = { fontSize: '26px', color: '#111111', margin: '0 0 16px', fontWeight: 700 }
const body = { fontSize: '15px', lineHeight: '1.6', color: '#333333', margin: '0 0 14px' }
const bullet = { fontSize: '15px', lineHeight: '1.6', color: '#333333', margin: '0 0 10px', paddingLeft: '12px' }
const ctaSection = { margin: '20px 0', textAlign: 'center' as const }
const button = {
  backgroundColor: '#1194ff',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 700,
  padding: '12px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
}
const ctaNote = { fontSize: '12px', color: '#888888', margin: '8px 0 0' }
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const signoff = { fontSize: '15px', color: '#333333', margin: '0 0 4px' }
const signature = { fontSize: '18px', fontWeight: 700, color: '#111111', margin: '0 0 10px' }
const footer = { fontSize: '13px', color: '#888888', margin: '0', lineHeight: '1.6' }
const footerLink = { color: '#1194ff', textDecoration: 'none' }
