import StaticPageLayout from '@/components/layout/landing/StaticPageLayout';

export default function SafetyPage() {
  return (
    <StaticPageLayout title="Safety & Trust" lastUpdated="March 29, 2026">
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">Our Commitment to Your Security</h2>
        <p className="mb-4 text-lg text-gray-400">
          3Dēx is designed to be a secure environment for creators and customers alike. 
          We prioritize data integrity and financial security in every transaction.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-3 text-emerald-400">Secure Payments</h3>
          <p className="text-gray-400">
            We use industry-standard encryption and trusted payment gateways like PayPal 
            and QRIS to ensure your financial details are never compromised.
          </p>
        </div>
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-3 text-emerald-400">Asset Verification</h3>
          <p className="text-gray-400">
            Every premium asset uploaded to our platform undergoes a rigorous quality 
            control check to ensure files are clean, as described, and ready to use.
          </p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">Reporting Issues</h2>
        <p className="mb-4">
          If you encounter any suspicious activity or content that violates our policies, 
          please use the reporting tools available on every product and post page, or 
          contact our security team directly.
        </p>
      </section>
    </StaticPageLayout>
  );
}
