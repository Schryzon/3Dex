import StaticPageLayout from '@/components/layout/landing/StaticPageLayout';

export default function CookiePolicyPage() {
  return (
    <StaticPageLayout title="Cookie Policy" lastUpdated="March 29, 2026">
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">1. What Are Cookies</h2>
        <p className="mb-4">
          Specifically, cookies are small text files that are dropped on your device when you
          visit a website. They are widely used to make websites work, or work more
          efficiently, as well as to provide information to the owners of the site.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Cookies</h2>
        <p className="mb-4">
          3Dēx uses cookies for several reasons. Some cookies are required for technical
          reasons for our websites to operate, and we refer to these as "essential" or
          "strictly necessary" cookies. Other cookies also enable us to track and target the
          interests of our users to enhance the experience on our Online Services.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">3. Types of Cookies We Use</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Essential website cookies:</strong> These cookies are strictly necessary to provide you with services available through our websites.</li>
          <li><strong>Performance and functionality cookies:</strong> These cookies are used to enhance the performance and functionality of our websites but are non-essential to their use.</li>
          <li><strong>Analytics and customization cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our websites are being used.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">4. Control Cookies</h2>
        <p className="mb-4">
          You have the right to decide whether to accept or reject cookies. You can set
          or amend your web browser controls to accept or refuse cookies. If you choose
          to reject cookies, you may still use our website though your access to some
          functionality and areas of our website may be restricted.
        </p>
      </section>
    </StaticPageLayout>
  );
}
