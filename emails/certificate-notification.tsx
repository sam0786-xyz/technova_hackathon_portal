import {
    Body,
    Button,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface CertificateNotificationEmailProps {
    userName: string;
    eventName: string;
    eventDate: string;
    organizerName: string;
    certificateType: string;
    roleTitle?: string;
    downloadUrl: string;
    verifyUrl: string;
}

export const CertificateNotificationEmail = ({
    userName,
    eventName,
    eventDate,
    organizerName,
    certificateType,
    roleTitle,
    downloadUrl,
    verifyUrl,
}: CertificateNotificationEmailProps) => {
    const roleDisplay = roleTitle || getCertificateTypeLabel(certificateType);

    return (
        <Html>
            <Head />
            <Preview>🎉 Your certificate for {eventName} is ready!</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Img
                            src="https://www.technovashardauniversity.in/assets/logo/technova-new.png"
                            width="150"
                            height="50"
                            alt="Technova"
                            style={{ margin: "0 auto" }}
                        />
                    </Section>

                    {/* Main Content */}
                    <Section style={content}>
                        <Heading style={h1}>
                            🎉 Certificate Ready!
                        </Heading>

                        <Text style={text}>
                            Hi <strong>{userName}</strong>,
                        </Text>

                        <Text style={text}>
                            Congratulations! Your certificate of <strong>{roleDisplay}</strong> for{" "}
                            <strong>{eventName}</strong> is now available for download.
                        </Text>

                        {/* Certificate Info Card */}
                        <Section style={certificateCard}>
                            <Row>
                                <Column>
                                    <Text style={cardLabel}>Event</Text>
                                    <Text style={cardValue}>{eventName}</Text>
                                </Column>
                            </Row>
                            <Row>
                                <Column>
                                    <Text style={cardLabel}>Date</Text>
                                    <Text style={cardValue}>{eventDate}</Text>
                                </Column>
                                <Column>
                                    <Text style={cardLabel}>Issued By</Text>
                                    <Text style={cardValue}>{organizerName}</Text>
                                </Column>
                            </Row>
                            <Row>
                                <Column>
                                    <Text style={cardLabel}>Certificate Type</Text>
                                    <Text style={cardValue}>{roleDisplay}</Text>
                                </Column>
                            </Row>
                        </Section>

                        {/* Action Buttons */}
                        <Section style={{ textAlign: "center", marginTop: "30px" }}>
                            <Button style={primaryButton} href={downloadUrl}>
                                Download Certificate
                            </Button>
                        </Section>

                        <Section style={{ textAlign: "center", marginTop: "15px" }}>
                            <Button style={secondaryButton} href={verifyUrl}>
                                View Verification Page
                            </Button>
                        </Section>

                        <Hr style={hr} />

                        <Text style={smallText}>
                            Your certificate contains a QR code that anyone can scan to verify its authenticity.
                            Share it on LinkedIn or include it in your resume!
                        </Text>

                        <Section style={{ textAlign: "center", marginTop: "20px" }}>
                            <Link href={getLinkedInShareUrl(eventName, roleDisplay, verifyUrl)} style={linkedInLink}>
                                🔗 Add to LinkedIn Profile
                            </Link>
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} Technova Technical Society
                        </Text>
                        <Text style={footerText}>
                            Sharda University, Greater Noida
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

function getCertificateTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        participation: "Participation",
        winner: "Winner",
        speaker: "Speaker",
        coordinator: "Coordinator",
        volunteer: "Volunteer",
    };
    return labels[type] || "Participation";
}

function getLinkedInShareUrl(eventName: string, role: string, verifyUrl: string): string {
    const title = `Certificate of ${role} - ${eventName}`;
    const text = `I'm excited to share that I received a Certificate of ${role} for ${eventName} at Technova, Sharda University! Verify it here:`;
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`;
}

export default CertificateNotificationEmail;

// Styles
const main = {
    backgroundColor: "#f6f6f6",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0",
    maxWidth: "580px",
};

const header = {
    backgroundColor: "#0f0f0f",
    padding: "30px 20px",
    borderRadius: "8px 8px 0 0",
    textAlign: "center" as const,
};

const content = {
    backgroundColor: "#ffffff",
    padding: "30px 40px",
    borderRadius: "0 0 8px 8px",
};

const h1 = {
    color: "#1a1a1a",
    fontSize: "28px",
    fontWeight: "bold",
    textAlign: "center" as const,
    marginBottom: "20px",
};

const text = {
    color: "#333333",
    fontSize: "16px",
    lineHeight: "26px",
};

const certificateCard = {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    padding: "20px",
    marginTop: "20px",
};

const cardLabel = {
    color: "#666666",
    fontSize: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "4px",
};

const cardValue = {
    color: "#1a1a1a",
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "16px",
};

const primaryButton = {
    backgroundColor: "#7c3aed",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 30px",
};

const secondaryButton = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "2px solid #7c3aed",
    color: "#7c3aed",
    fontSize: "14px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "10px 24px",
};

const hr = {
    borderColor: "#e0e0e0",
    margin: "30px 0",
};

const smallText = {
    color: "#666666",
    fontSize: "14px",
    lineHeight: "22px",
    textAlign: "center" as const,
};

const linkedInLink = {
    color: "#0a66c2",
    fontSize: "14px",
    fontWeight: "bold",
    textDecoration: "underline",
};

const footer = {
    textAlign: "center" as const,
    padding: "20px",
};

const footerText = {
    color: "#999999",
    fontSize: "12px",
    margin: "4px 0",
};
