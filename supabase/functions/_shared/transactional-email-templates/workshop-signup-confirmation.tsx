import * as React from 'npm:react@18.3.1';
import { Body, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22';
import type { TemplateEntry } from './registry.ts';

function Email({ name = 'there', topics = '' }: { name?: string; topics?: string }) {
  return <Html lang="en"><Head /><Preview>Your workshop interest signup is received</Preview>
    <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <Container style={{ maxWidth: '560px', padding: '28px' }}>
        <Text style={{ color: '#474746', fontSize: '12px', fontWeight: 700 }}>MODERN NOSTALGIA CLUB</Text>
        <Heading style={{ color: '#111111', fontSize: '26px' }}>You're on the workshop interest list</Heading>
        <Text style={{ color: '#333333', lineHeight: '24px' }}>Hi {name},</Text>
        <Text style={{ color: '#333333', lineHeight: '24px' }}>Thanks for sharing your interest in our artist workshops{topics ? ` on ${topics.toLowerCase()}` : ''}. We received your signup and preferences.</Text>
        <Text style={{ color: '#333333', lineHeight: '24px' }}>Exact dates are still being confirmed. This is an expression of interest, not a ticket or a reserved seat. Confirmed sessions and registration links will appear on the website.</Text>
        <Text style={{ color: '#474746', fontSize: '13px' }}>Questions? Reply to this email.<br />Ge Oh, Modern Nostalgia Club</Text>
      </Container>
    </Body>
  </Html>;
}
export const template = {
  component: Email,
  subject: 'We received your artist workshop signup',
  displayName: 'Workshop signup confirmation',
  previewData: { name: 'Jane', topics: 'Publishing' },
} satisfies TemplateEntry;