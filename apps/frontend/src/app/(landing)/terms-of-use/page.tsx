import StaticPageLayout from '@/components/layout/landing/StaticPageLayout';

export default function TermsOfUsePage() {
  return (
    <StaticPageLayout title="Terms of Use" lastUpdated="March 29, 2026">
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">1. Agreement to Terms</h2>
        <p className="mb-4">
          By accessing or using the 3Dēx website, services, and software, you agree to be bound
          by these Terms of Use and all applicable laws and regulations. If you do not agree
          with any of these terms, you are prohibited from using or accessing this site.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">2. Use License</h2>
        <p className="mb-4">
          Permission is granted to temporarily download one copy of the materials (information or
          software) on 3Dēx's website for personal, non-commercial transitory viewing only.
          This is the grant of a license, not a transfer of title, and under this license you
          may not:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Modify or copy the materials;</li>
          <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
          <li>Attempt to decompile or reverse engineer any software contained on 3Dēx's website;</li>
          <li>Remove any copyright or other proprietary notations from the materials; or</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">3. Disclaimer</h2>
        <p className="mb-4">
          The materials on 3Dēx's website are provided on an 'as is' basis. 3Dēx makes no
          warranties, expressed or implied, and hereby disclaims and negates all other warranties
          including, without limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual property or
          other violation of rights.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">4. Limitations</h2>
        <p className="mb-4">
          In no event shall 3Dēx or its suppliers be liable for any damages (including, without
          limitation, damages for loss of data or profit, or due to business interruption) arising
          out of the use or inability to use the materials on 3Dēx's website, even if 3Dēx
          or a 3Dēx authorized representative has been notified orally or in writing of the
          possibility of such damage.
        </p>
      </section>
    </StaticPageLayout>
  );
}
