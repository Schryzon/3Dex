import StaticPageLayout from '@/components/layout/landing/StaticPageLayout';

export default function LicensePage() {
  return (
    <StaticPageLayout title="License" lastUpdated="March 29, 2026">
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">1. Content Licenses</h2>
        <p className="mb-4">
          All 3D models and digital assets provided on 3Dēx are licensed under specific
          license agreements. When you download a model, you're not purchasing the model
          itself, but a license to use it in your projects.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">2. Standard License</h2>
        <p className="mb-4">
          Our Standard License allows you to use the downloaded content in an unlimited
          number of personal and commercial projects. This includes use in advertising,
          websites, movies, television, and more.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">3. Restrictions</h2>
        <p className="mb-4">
          Unless specifically stated otherwise, you may not:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Resell, redistribute, or transfer the content to any third party;</li>
          <li>Use the content in a way that suggests an endorsement by the creator;</li>
          <li>Incorporate the content into a logo, trademark, or service mark;</li>
          <li>Claim ownership of the content.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">4. Attribution</h2>
        <p className="mb-4">
          Some licenses may require attribution. Please check the specific license terms
          provided with each download for more information on how to properly attribute
          the creator.
        </p>
      </section>
    </StaticPageLayout>
  );
}
