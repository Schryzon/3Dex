import StaticPageLayout from '@/components/layout/landing/StaticPageLayout';

export default function RulesPage() {
  return (
    <StaticPageLayout title="Community Rules" lastUpdated="March 29, 2026">
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">1. Be Respectful</h2>
        <p className="mb-4 text-lg text-gray-400">
          3Dēx is a worldwide community. All members must treat each other with professional 
          courtesy regardless of expertise or background.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">2. Content Integrity</h2>
        <ul className="list-disc pl-6 space-y-4 text-gray-400 font-medium">
          <li><strong>No Plagiarism:</strong> Only upload content you own or have the right to distribute.</li>
          <li><strong>Accurate Descriptions:</strong> Ensure your product thumbnails and descriptions match the 
            actual deliverables.</li>
          <li><strong>Quality Standards:</strong> Respect the community by providing clean, usable files.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">3. Commercial Ethics</h2>
        <p className="mb-4">
          Unfair competition, price manipulation, or harassment of other creators is strictly prohibited. 
          We believe in a fair marketplace that rewards quality and innovation.
        </p>
      </section>

      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center">
        <h3 className="text-xl font-bold text-white mb-3">Enforcement</h3>
        <p className="text-gray-400 mb-0">
          Violation of these rules may lead to restricted account access, loss of earning privileges, 
          or permanent suspension from the 3Dēx ecosystem.
        </p>
      </div>
    </StaticPageLayout>
  );
}
