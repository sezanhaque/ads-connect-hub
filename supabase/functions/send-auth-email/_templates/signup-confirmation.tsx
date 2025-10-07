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

  return (
    <Html>
      <Head />
      <Preview>Welcome to Twenty Twenty solutions - Confirm your email to get started</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚡ Twenty Twenty solutions</Heading>
          <Heading style={h2}>Welcome to Twenty Twenty solutions!</Heading>

          <Section style={section}>
            <Text style={text}>
              Hi <strong>{userName}</strong>,
            </Text>

            <Text style={text}>
              Thank you for signing up! We're excited to have you on board. Please confirm your email address to get
              started with Twenty Twenty solutions.
            </Text>

            <div style={buttonContainer}>
              <Link href={confirmUrl} style={button}>
                Confirm Email Address
              </Link>
            </div>

            <Text style={smallText}>
              If the button doesn't work, copy and paste this link into your browser:
              <br />
              <span style={linkText}>{confirmUrl}</span>
            </Text>
          </Section>

          <Section style={featuresSection}>
            <Heading style={h3}>What you'll get access to:</Heading>
            <ul style={list}>
              <li style={listItem}>Dashboard with campaign insights and metrics</li>
              <li style={listItem}>Campaign creation and management tools</li>
              <li style={listItem}>Job posting and recruitment features</li>
              <li style={listItem}>Meta Marketing API integration</li>
            </ul>
          </Section>

          <Text style={footer}>
            If you didn't create an account with Twenty Twenty solutions, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SignupConfirmationEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "Arial, sans-serif",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
};

const h1 = {
  color: "#333",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  marginBottom: "10px",
};

const h2 = {
  color: "#666",
  fontSize: "20px",
  fontWeight: "normal" as const,
  textAlign: "center" as const,
  marginBottom: "30px",
};

const h3 = {
  color: "#333",
  fontSize: "16px",
  marginBottom: "10px",
};

const section = {
  background: "#f8f9fa",
  padding: "25px",
  borderRadius: "8px",
  marginBottom: "25px",
};

const text = {
  fontSize: "16px",
  color: "#333",
  marginBottom: "15px",
  lineHeight: "1.5",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "20px",
  marginBottom: "20px",
};

const button = {
  background: "#007bff",
  color: "white",
  padding: "12px 30px",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  display: "inline-block",
};

const smallText = {
  fontSize: "12px",
  color: "#777",
  textAlign: "center" as const,
  marginTop: "10px",
  lineHeight: "1.4",
};

const linkText = {
  wordBreak: "break-all" as const,
  color: "#333",
};

const featuresSection = {
  background: "#e9ecef",
  padding: "20px",
  borderRadius: "6px",
  marginBottom: "20px",
};

const list = {
  color: "#666",
  fontSize: "14px",
  margin: "0",
  paddingLeft: "20px",
};

const listItem = {
  marginBottom: "8px",
};

const footer = {
  fontSize: "12px",
  color: "#999",
  textAlign: "center" as const,
  marginTop: "30px",
};
