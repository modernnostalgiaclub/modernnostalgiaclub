import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://www.modernnostalgia.club'
const BLOG_URL = 'https://www.modernnostalgia.club/blog'

const Email = () => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're on the list for Lab events and resources.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>MODERN NOSTALGIA CLUB</Text>
        <Heading style={heading}>You're on the list.</Heading>
        <Text style={body}>
          Thanks for signing up. You'll hear from us about upcoming Lab events and resources for
          independent artists. Nothing else.
        </Text>
        <Text style={body}>
          While you're here, the latest lessons and posts are always free to read on the blog.
        </Text>
        <Section style={ctaSection}>
          <Button style={button} href={BLOG_URL}>
            Read the latest posts
          </Button>
        </Section>
        <Text style={signoff}>To your growth,</Text>
        <Text style={signature}>Ge Oh</Text>
        <Text style={footer}>
          modernnostalgiaclub LLC
          <br />
          <Link href={SITE_URL} style={footerLink}>
            www.modernnostalgia.club
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: "You're on the list for Lab events and resources",
  displayName: 'Lab updates signup confirmation',
  previewData: {},
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '28px 28px 40px', maxWidth: '560px' }
const kicker = { fontSize: '11px', letterSpacing: '2px', color: '#1194ff', margin: '0 0 6px', fontWeight: 700 }
const heading = { fontSize: '26px', color: '#111111', margin: '0 0 16px', fontWeight: 700 }
const body = { fontSize: '15px', lineHeight: '1.6', color: '#333333', margin: '0 0 14px' }
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
const signoff = { fontSize: '15px', color: '#333333', margin: '0 0 4px' }
const signature = { fontSize: '18px', fontWeight: 700, color: '#111111', margin: '0 0 10px' }
const footer = { fontSize: '13px', color: '#888888', margin: '0', lineHeight: '1.6' }
const footerLink = { color: '#1194ff', textDecoration: 'none' }
