import StaticPageLayout from '@/components/layout/landing/StaticPageLayout';

export default function AboutUsPage() {
  return (
    <StaticPageLayout title="About Us" lastUpdated="March 29, 2026">
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">Our Mission</h2>
        <p className="mb-4 text-lg text-gray-400">
          At 3Dēx, we are dedicated to revolutionizing the way 3D artists and users connect. 
          Our platform serves as a bridge, making professional-grade 3D assets accessible 
          to everyone, while providing creators with the tools they need to thrive.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-3">The Platform</h3>
          <p className="text-gray-400">
            A comprehensive marketplace for 3D models, textures, and HDRIs, 
            optimized for both real-time engines and high-fidelity rendering.
          </p>
        </div>
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-3">The Community</h3>
          <p className="text-gray-400">
            A vibrant ecosystem where designers, developers, and hobbyists 
            share knowledge and push the boundaries of digital art.
          </p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-white">Join the Journey</h2>
        <p className="mb-4">
          Whether you're a seasoned professional or just starting out in 3D, 
          3Dēx is here to support your creative journey. Explore our curated 
          collections and start building your next masterpiece today.
        </p>
      </section>
    </StaticPageLayout>
  );
}
