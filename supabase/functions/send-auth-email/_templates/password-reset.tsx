import { Body, Container, Head, Heading, Html, Link, Preview, Text, Section } from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

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
  const isMagicLink = email_action_type === "magiclink";
  const logoUrl =
    "https://raw.githubusercontent.com/sezanhaque/ads-connect-hub/refs/heads/main/src/assets/logo-new.png";

  return (
    <Html>
      <Head />
      <Preview>{isMagicLink ? "Your 20/20 Solutions magic link" : "Reset your 20/20 Solutions password"}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <img src={logoUrl} alt="20/20 Solutions" style={logo} />
          </Section>

          <Section style={content}>
            <Heading style={h1}>{isMagicLink ? "Your Magic Link" : "Reset Your Password"}</Heading>

            <Text style={text}>
              Hi <strong>{userName}</strong>,
            </Text>

            <Text style={text}>
              {isMagicLink
                ? "Click the button below to sign in to your 20/20 Solutions account:"
                : "We received a request to reset your password. Click the button below to create a new password:"}
            </Text>

            <div style={buttonContainer}>
              <Link href={resetUrl} style={button}>
                {isMagicLink ? "Sign In" : "Reset Password"}
              </Link>
            </div>

            <Text style={smallText}>If the button doesn't work, copy and paste this link into your browser:</Text>
            <Text style={linkText}>{resetUrl}</Text>

            {!isMagicLink && (
              <Section style={warningSection}>
                <Text style={warningText}>⚠️ This link will expire in 1 hour for security reasons.</Text>
              </Section>
            )}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              {isMagicLink
                ? "If you didn't request this magic link, you can safely ignore this email."
                : "If you didn't request a password reset, please ignore this email or contact support if you have concerns."}
            </Text>
            <Text style={footerText}>© 2025 20/20 Solutions. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

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

const warningSection = {
  background: "#fff8e1",
  padding: "16px",
  borderRadius: "8px",
  borderLeft: "4px solid #ffc107",
  marginTop: "24px",
};

const warningText = {
  fontSize: "14px",
  color: "#f57c00",
  margin: "0",
  fontWeight: "500" as const,
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
