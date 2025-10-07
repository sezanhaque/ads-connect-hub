import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PasswordResetEmailProps {
  supabase_url: string;
  email_action_type: string;
  redirect_to: string;
  token_hash: string;
  token: string;
  userName: string;
}

export const PasswordResetEmail = ({
  token_hash,
  supabase_url,
  email_action_type,
  redirect_to,
  userName,
}: PasswordResetEmailProps) => {
  const resetUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
  const isMagicLink = email_action_type === 'magiclink';

  return (
    <Html>
      <Head />
      <Preview>
        {isMagicLink ? 'Your AdsConnect magic link' : 'Reset your AdsConnect password'}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚡ AdsConnect</Heading>
          <Heading style={h2}>
            {isMagicLink ? 'Your Magic Link' : 'Reset Your Password'}
          </Heading>
          
          <Section style={section}>
            <Text style={text}>
              Hi <strong>{userName}</strong>,
            </Text>
            
            <Text style={text}>
              {isMagicLink
                ? 'Click the button below to sign in to your AdsConnect account:'
                : 'We received a request to reset your password. Click the button below to create a new password:'}
            </Text>
            
            <div style={buttonContainer}>
              <Link href={resetUrl} style={button}>
                {isMagicLink ? 'Sign In to AdsConnect' : 'Reset Password'}
              </Link>
            </div>

            <Text style={smallText}>
              If the button doesn't work, copy and paste this link into your browser:
              <br />
              <span style={linkText}>{resetUrl}</span>
            </Text>

            {!isMagicLink && (
              <Section style={warningSection}>
                <Text style={warningText}>
                  ⚠️ This link will expire in 1 hour for security reasons.
                </Text>
              </Section>
            )}
          </Section>
          
          <Text style={footer}>
            {isMagicLink
              ? "If you didn't request this magic link, you can safely ignore this email."
              : "If you didn't request a password reset, please ignore this email or contact support if you have concerns."}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
};

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  marginBottom: '10px',
};

const h2 = {
  color: '#666',
  fontSize: '20px',
  fontWeight: 'normal' as const,
  textAlign: 'center' as const,
  marginBottom: '30px',
};

const section = {
  background: '#f8f9fa',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '25px',
};

const text = {
  fontSize: '16px',
  color: '#333',
  marginBottom: '15px',
  lineHeight: '1.5',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '20px',
  marginBottom: '20px',
};

const button = {
  background: '#007bff',
  color: 'white',
  padding: '12px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  display: 'inline-block',
};

const smallText = {
  fontSize: '12px',
  color: '#777',
  textAlign: 'center' as const,
  marginTop: '10px',
  lineHeight: '1.4',
};

const linkText = {
  wordBreak: 'break-all' as const,
  color: '#333',
};

const warningSection = {
  background: '#fff3cd',
  padding: '15px',
  borderRadius: '6px',
  borderLeft: '4px solid #ffc107',
  marginTop: '20px',
};

const warningText = {
  fontSize: '14px',
  color: '#856404',
  margin: '0',
};

const footer = {
  fontSize: '12px',
  color: '#999',
  textAlign: 'center' as const,
  marginTop: '30px',
};
