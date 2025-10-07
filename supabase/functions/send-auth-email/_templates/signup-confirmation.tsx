import { Body, Container, Head, Heading, Html, Link, Preview, Text, Section } from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface SignupConfirmationEmailProps {
  supabase_url: string;
  email_action_type: string;
  redirect_to: string;
  token_hash: string;
  token: string;
  userName: string;
}

export const SignupConfirmationEmail = ({
  token_hash,
  supabase_url,
  email_action_type,
  redirect_to,
  userName,
}: SignupConfirmationEmailProps) => {
  const confirmUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;
  const logoUrl =
    "https://raw.githubusercontent.com/sezanhaque/ads-connect-hub/refs/heads/main/src/assets/logo-new.png";

  return (
    <Html>
      <Head />
      <Preview>Welcome to 20/20 Solutions - Confirm your email to get started</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <img src={logoUrl} alt="20/20 Solutions" style={logo} />
          </Section>

          <Section style={content}>
            <Heading style={h1}>Welcome to 20/20 Solutions!</Heading>

            <Text style={text}>
              Hi <strong>{userName}</strong>,
            </Text>

            <Text style={text}>
              Thank you for signing up! We're excited to have you on board. Please confirm your email address to get
              started with 20/20 Solutions.
            </Text>

            <div style={buttonContainer}>
              <Link href={confirmUrl} style={button}>
                Confirm Email Address
              </Link>
            </div>

            <Text style={smallText}>If the button doesn't work, copy and paste this link into your browser:</Text>
            <Text style={linkText}>{confirmUrl}</Text>

            <Section style={featuresSection}>
              <Heading style={h3}>What you'll get access to:</Heading>
              <ul style={list}>
                <li style={listItem}>📊 Dashboard with campaign insights and metrics</li>
                <li style={listItem}>🚀 Campaign creation and management tools</li>
                <li style={listItem}>💼 Job posting and recruitment features</li>
                <li style={listItem}>📱 Meta Marketing API integration</li>
              </ul>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              If you didn't create an account with 20/20 Solutions, you can safely ignore this email.
            </Text>
            <Text style={footerText}>© 2025 20/20 Solutions. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SignupConfirmationEmail;

const main = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  padding: "40px 0",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const header = {
  backgroundColor: "#0091AE",
  padding: "30px 40px",
  textAlign: "center" as const,
};

const logo = {
  height: "60px",
  width: "auto",
};

const content = {
  padding: "40px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "600" as const,
  textAlign: "center" as const,
  marginBottom: "24px",
  marginTop: "0",
};

const h3 = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600" as const,
  marginBottom: "16px",
  marginTop: "0",
};

const text = {
  fontSize: "16px",
  color: "#333333",
  marginBottom: "16px",
  lineHeight: "1.6",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#0091AE",
  color: "#ffffff",
  padding: "14px 40px",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "600" as const,
  fontSize: "16px",
  display: "inline-block",
};

const smallText = {
  fontSize: "13px",
  color: "#666666",
  textAlign: "center" as const,
  marginTop: "24px",
  marginBottom: "8px",
  lineHeight: "1.5",
};

const linkText = {
  wordBreak: "break-all" as const,
  color: "#0091AE",
  fontSize: "12px",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
  backgroundColor: "#f8f9fa",
  borderRadius: "6px",
  marginTop: "8px",
};

const featuresSection = {
  background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  padding: "24px",
  borderRadius: "8px",
  marginTop: "32px",
  border: "1px solid #e0e0e0",
};

const list = {
  color: "#333333",
  fontSize: "15px",
  margin: "0",
  paddingLeft: "0",
  listStyle: "none",
};

const listItem = {
  marginBottom: "12px",
  padding: "8px 0",
};

const footer = {
  backgroundColor: "#f8f9fa",
  padding: "32px 40px",
  textAlign: "center" as const,
  borderTop: "1px solid #e0e0e0",
};

const footerText = {
  fontSize: "13px",
  color: "#666666",
  margin: "8px 0",
  lineHeight: "1.5",
};
