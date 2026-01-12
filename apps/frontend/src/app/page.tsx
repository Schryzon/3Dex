// src/app/page.tsx
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Navbar dengan Register Modal */}
      <Navbar 
        logo="3Dēx"
        navItems={[
          { label: "3D Models", href: "/models" },
          { label: "CG Models", href: "/cg-models", badge: "NEW" },
          { label: "Textures", href: "/textures" }
        ]}
      />

      {/* Hero Section dengan Background Image */}
      <Hero 
        backgroundImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
        stats="1.8M"
        subtitle="Trusted by over"
        title="The grandest 3D asset collection"
        description="Manage and distribute your 3D Models and Textures assets. Elevate your CG art to a higher level with our top-notch quality content!"
        ctaText="Join for free"
        ctaHref="/register"
      />

      {/* Tambahkan section lain di sini kalau perlu */}
      {/* Contoh: Featured Models, Categories, dll */}

      {/* Footer dengan 5 kolom dan Payment Methods */}
      <Footer />
    </main>
  );
}
