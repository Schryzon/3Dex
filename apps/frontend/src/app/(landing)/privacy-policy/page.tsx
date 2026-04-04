import StaticPageLayout from '@/components/layout/landing/StaticPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout title="Privacy Policy" lastUpdated="March 29, 2026">
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
        <p className="mb-4">
          Welcome to 3Dēx. We respect your privacy and are committed to protecting your personal data.
          This privacy policy will inform you as to how we look after your personal data when you visit
          our website (regardless of where you visit it from) and tell you about your privacy rights
          and how the law protects you.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">2. The Data We Collect About You</h2>
        <p className="mb-4">
          Personal data, or personal information, means any information about an individual from which
          that person can be identified. It does not include data where the identity has been removed
          (anonymous data).
        </p>
        <p className="mb-4">
          We may collect, use, store and transfer different kinds of personal data about you which we
          have grouped together as follows:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
          <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
          <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Personal Data</h2>
        <p className="mb-4">
          We will only use your personal data when the law allows us to. Most commonly, we will use
          your personal data in the following circumstances:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
          <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
          <li>Where we need to comply with a legal obligation.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Security</h2>
        <p className="mb-4">
          We have put in place appropriate security measures to prevent your personal data from being
          accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition,
          we limit access to your personal data to those employees, agents, contractors and other third
          parties who have a business need to know.
        </p>
      </section>
    </StaticPageLayout>
  );
}
