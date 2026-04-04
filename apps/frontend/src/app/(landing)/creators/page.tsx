import StaticPageLayout from '@/components/layout/landing/StaticPageLayout';

export default function CreatorsPage() {
  return (
    <StaticPageLayout title="The Creator Community" lastUpdated="March 29, 2026">
      <section className="mb-10 text-center py-12 px-6 bg-gradient-to-tr from-yellow-500/10 to-amber-700/10 rounded-3xl border border-yellow-500/10">
        <h1 className="text-4xl font-black text-white mb-6">Empowering Artists to Build the Future</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          3Dēx is where creators meet users. We are building the most designer-friendly 
          ecosystem for selling digital 3D assets and getting discovered.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 my-16">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Why Create on 3Dēx?</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
               <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold shrink-0">1</div>
               <p className="text-gray-400 font-medium">Industry-leading revenue share with transparent, fast payouts.</p>
            </li>
            <li className="flex items-start gap-4">
               <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold shrink-0">2</div>
               <p className="text-gray-400 font-medium">Built-in marketing tools and a community that loves to share your work.</p>
            </li>
            <li className="flex items-start gap-4">
               <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold shrink-0">3</div>
               <p className="text-gray-400 font-medium">Robust DRM and license management for your intellectual property.</p>
            </li>
          </ul>
        </div>
        <div className="p-8 bg-gray-900 rounded-3xl border border-gray-800 flex flex-col justify-center">
           <h3 className="text-xl font-bold text-white mb-3">Become a Verified Artist</h3>
           <p className="text-gray-400 mb-6 font-medium">
             Join our waitlist for the invitation-only creator program. 
             Be part of the founding community.
           </p>
           <button className="bg-white text-black font-black py-4 rounded-xl hover:scale-105 transition-all">
             Apply to Create
           </button>
        </div>
      </div>
    </StaticPageLayout>
  );
}
