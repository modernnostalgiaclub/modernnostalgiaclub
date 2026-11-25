import * as React from 'npm:react@18.3.1';
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22';
import type { TemplateEntry } from './registry.ts';

interface Props {
  serviceName?: string;
  name?: string;
  email?: string;
  artistName?: string;
  needs?: string;
  links?: string;
  preferredTiming?: string;
}

function Email({ serviceName = 'Service', name = '', email = '', artistName = '', needs = '', links = '', preferredTiming = '' }: Props) {
  return <Html lang="en" dir="ltr"><Head /><Preview>{`New ${serviceName} booking request from ${name}`}</Preview>
    <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <Container style={{ maxWidth: '560px', padding: '28px' }}>
        <Text style={{ color: '#474746', fontSize: '12px', fontWeight: 700 }}>MODERN NOSTALGIA CLUB</Text>
        <Heading style={{ color: '#111111', fontSize: '26px' }}>New booking request</Heading>
        {[
          ['Service', serviceName], ['Name', name], ['Email', email], ['Artist name', artistName],
          ['Needs', needs], ['Music or project links', links], ['Preferred timing', preferredTiming],
        ].map(([label, value]) => <React.Fragment key={label}>
          <Text style={{ color: '#474746', fontWeight: 700, fontSize: '12px', margin: '18px 0 4px' }}>{label}</Text>
          <Text style={{ color: '#111111', fontSize: '15px', lineHeight: '24px', whiteSpace: 'pre-wrap', margin: '0' }}>{value || 'Not provided'}</Text>
        </React.Fragment>)}
        <Text style={{ color: '#474746', fontSize: '13px', marginTop: '24px' }}>This is an inquiry. No appointment has been reserved and no payment has been collected.</Text>
        <Button href="https://www.modernnostalgia.club/admin?tab=service-requests" style={{ backgroundColor: '#474746', color: '#ffffff', padding: '12px 18px', borderRadius: '4px', fontSize: '14px' }}>Review booking requests</Button>
      </Container>
    </Body>
  </Html>;
}

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) => `New ${data.serviceName || 'service'} booking request`,
  displayName: 'Service booking request alert',
  to: 'ge@modernnostalgia.club',
  previewData: { serviceName: 'Mogul Publishing Audit', name: 'Jane', email: 'artist@example.com', needs: 'I need help checking my publishing registrations.' },
} satisfies TemplateEntry;