import { ChevronDown } from 'lucide-react';
import StaticPageLayout from '@/components/layout/landing/StaticPageLayout';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4 hover:border-emerald-500/30 transition-colors">
    <div className="flex items-center justify-between gap-4 mb-3">
      <h3 className="text-xl font-bold text-white leading-tight">{question}</h3>
      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
    </div>
    <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
      {answer}
    </p>
  </div>
);

export default function FAQPage() {
  return (
    <StaticPageLayout title="FAQ" lastUpdated="March 29, 2026">
      <div className="max-w-3xl mx-auto space-y-6 mb-16">
        <FAQItem 
          question="What is 3Dēx?"
          answer="3Dēx is a premium marketplace for high-quality 3D assets, including models, textures, and HDRIs. Our platform connects skilled artists with creators who need professional resources for their digital projects."
        />
        <FAQItem 
          question="Can I sell my own models?"
          answer="Absolutely! 3Dēx is a thriving community. You can apply to become a creator, upload your work, and start earning from your designs. We provide the tools and exposure you need to reach global buyers."
        />
        <FAQItem 
          question="Are the assets royalty-free?"
          answer="Yes, most of our assets come with a standard royalty-free license, meaning you can use them in multiple projects without additional fees. Check the license terms on the product page for specific details."
        />
        <FAQItem 
          question="How do I get support for a purchase?"
          answer="If you encounter any issues with a downloaded asset, you can reach out directly to the creator or contact our support team at 3dexweb@gmail.com. We're committed to ensuring you have a seamless experience."
        />
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
        <p className="text-gray-400 mb-6">
          Can't find the answer you're looking for? Please chat with our friendly team.
        </p>
        <a 
          href="/contact-us"
          className="inline-flex items-center justify-center px-8 h-12 bg-white text-black font-bold rounded-xl transition-transform hover:scale-105 active:scale-95"
        >
          Contact Us
        </a>
      </div>
    </StaticPageLayout>
  );
}
