import { useSelector } from "react-redux";
import BannerCarousel from "../components/BannerCarousel";
import type { RootState } from "../store/Store";

const BANNER_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1440&h=400&fit=crop",
    title: "Terms & Conditions",
    subtitle: "Please read these terms carefully before using our services.",
  },
];

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using this website and any of its numerology, consultation, or VIP number booking services, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please discontinue use of the website immediately.`,
  },
  {
    title: "2. Our Services",
    body: `We provide numerology consultations, name correction guidance, business numerology assessments, and VIP mobile number booking services. All services are offered on an advisory basis and are intended to complement — not replace — professional legal, medical, or financial advice.`,
  },
  {
    title: "3. Bookings & Payments",
    body: `All bookings made through this website, over phone, or via our representatives are subject to availability and confirmation. Payments must be made in full through the approved payment channels shown on the site (UPI, cards, net banking). Prices are subject to change without prior notice, though confirmed bookings will honour the price agreed at the time of confirmation.`,
  },
  {
    title: "4. Numerology Disclaimer",
    body: `Numerology is a belief system based on ancient traditions. Recommendations, number suggestions, and readings provided are for guidance and entertainment purposes and do not guarantee specific outcomes. Individual results may vary, and we make no warranties regarding life events, financial gain, or personal success arising from following our recommendations.`,
  },
  {
    title: "5. User Responsibilities",
    body: `You agree to provide accurate personal information (such as name, date of birth, and contact details) required for consultations. Providing false information may affect the accuracy of any reading or recommendation given, and we are not liable for outcomes resulting from inaccurate data supplied by the user.`,
  },
  {
    title: "6. Intellectual Property",
    body: `All content on this website — including text, graphics, logos, reports, and numerology methodologies — is the property of the company and protected under applicable copyright and trademark laws. You may not reproduce, distribute, or repurpose our content without prior written consent.`,
  },
  {
    title: "7. Cancellations & Refunds",
    body: `Cancellation and refund requests are evaluated on a case-by-case basis depending on the stage of service delivery. Consultation fees already utilised for report preparation or numerologist time are generally non-refundable. Please refer to your booking confirmation for service-specific terms.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `To the fullest extent permitted by law, the company shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or services, including decisions made based on numerology guidance provided.`,
  },
  {
    title: "9. Third-Party Links",
    body: `Our website may contain links to third-party websites (such as social media or payment gateways). We are not responsible for the content, privacy practices, or terms of those external sites.`,
  },
  {
    title: "10. Changes to These Terms",
    body: `We may update these Terms & Conditions from time to time to reflect changes in our services or legal requirements. Continued use of the website after any changes constitutes acceptance of the revised terms.`,
  },
  {
    title: "11. Governing Law",
    body: `These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from the use of our services shall be subject to the exclusive jurisdiction of the courts in our registered place of business.`,
  },
];

export default function TermsAndConditions() {
  const { data: contact } = useSelector((state: RootState) => state.contact);

  return (
    <div>
      <BannerCarousel
        slides={BANNER_SLIDES}
        pageName="Terms & Conditions"
        breadcrumb="Terms & Conditions"
      />

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">
              Legal
            </div>
            <h2
              className="text-3xl font-bold text-[#212121] mb-3"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Terms & Conditions
            </h2>
            <p className="text-[#616161] leading-relaxed">
              Last updated: January 2026. These Terms & Conditions govern your
              use of our website and the numerology, consultation, and VIP
              number booking services offered by us.
            </p>
          </div>

          <div className="space-y-8">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h3
                  className="text-lg font-bold text-[#212121] mb-2"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {s.title}
                </h3>
                <p className="text-[#616161] leading-relaxed text-[15px]">
                  {s.body}
                </p>
              </div>
            ))}

            <div>
              <h3
                className="text-lg font-bold text-[#212121] mb-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                12. Contact Us
              </h3>
              <p className="text-[#616161] leading-relaxed text-[15px]">
                If you have any questions about these Terms & Conditions,
                please reach out to us
                {contact?.officeEmail ? ` at ${contact.officeEmail}` : ""}
                {contact?.contactNumber ? ` or call ${contact.contactNumber}` : ""}.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
