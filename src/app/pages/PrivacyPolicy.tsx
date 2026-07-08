import { useSelector } from "react-redux";
import BannerCarousel from "../components/BannerCarousel";
import type { RootState } from "../store/Store";

const BANNER_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1440&h=400&fit=crop",
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your personal information.",
  },
];

const SECTIONS = [
  {
    title: "1. Introduction",
    body: `This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website or use our numerology consultation and VIP number booking services. We are committed to protecting your privacy and handling your data responsibly.`,
  },
  {
    title: "2. Information We Collect",
    body: `We may collect personal details such as your name, date of birth, gender, phone number, email address, and postal address when you book a consultation, request a VIP number, or submit an inquiry form. We may also collect technical information such as your IP address, browser type, and device information automatically when you visit our site.`,
  },
  {
    title: "3. How We Use Your Information",
    body: `Your information is used to prepare personalised numerology reports, process bookings and payments, deliver VIP numbers, respond to inquiries, send appointment reminders, and improve our website and services. With your consent, we may also send promotional updates about offers and events.`,
  },
  {
    title: "4. Cookies & Tracking Technologies",
    body: `We use cookies and similar tracking technologies to remember your preferences, understand site usage, and enhance your browsing experience. You can control cookie settings through your browser, though disabling cookies may limit certain features of the website.`,
  },
  {
    title: "5. Data Sharing & Third Parties",
    body: `We do not sell your personal information. We may share necessary details with trusted third parties such as payment gateways, SIM/number delivery partners, and analytics providers strictly for the purpose of fulfilling your request. These partners are required to handle your data securely and only for the intended purpose.`,
  },
  {
    title: "6. Data Retention",
    body: `We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Consultation records may be retained to support future follow-up services unless you request deletion.`,
  },
  {
    title: "7. Data Security",
    body: `We implement reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "8. Your Rights",
    body: `You have the right to access, correct, or request deletion of your personal information held by us. You may also opt out of receiving promotional communications at any time by contacting us directly using the details below.`,
  },
  {
    title: "9. Children's Privacy",
    body: `Our services are not directed at individuals under the age of 18. We do not knowingly collect personal information from minors without verified parental or guardian consent.`,
  },
  {
    title: "10. Changes to This Policy",
    body: `We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. Any updates will be posted on this page with a revised "last updated" date, and continued use of our services constitutes acceptance of the changes.`,
  },
];

export default function PrivacyPolicy() {
  const { data: contact } = useSelector((state: RootState) => state.contact);

  return (
    <div>
      <BannerCarousel
        slides={BANNER_SLIDES}
        pageName="Privacy Policy"
        breadcrumb="Privacy Policy"
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
              Privacy Policy
            </h2>
            <p className="text-[#616161] leading-relaxed">
              Last updated: January 2026. Your privacy matters to us. This
              policy describes what information we collect and how it is
              used when you interact with our website and services.
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
                11. Contact Us
              </h3>
              <p className="text-[#616161] leading-relaxed text-[15px]">
                If you have questions or requests regarding this Privacy
                Policy or your personal data, please contact us
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
