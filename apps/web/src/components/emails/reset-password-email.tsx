import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  username?: string;
  resetLink?: string;
}

export const ResetPasswordEmail = ({
  username = "there",
  resetLink = "http://localhost:3000/reset-password",
}: ResetPasswordEmailProps) => {
  const previewText = `Reset your Genia password`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Reset your <strong>Genia</strong> password
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {username},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Someone recently requested a password change for your Genia
              account. If this was you, you can set a new password here:
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={resetLink}
              >
                Reset Password
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              If you don&apos;t want to change your password or didn&apos;t
              request this, just ignore and delete this message.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              To keep your account secure, please don&apos;t forward this email
              to anyone.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;
