import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Github, ArrowLeft, ExternalLink, Code2, Server, Palette, Plug, ChevronRight } from 'lucide-react';

type MemberSlug = 'jay' | 'mahesa' | 'thoriq';

const memberData: Record<MemberSlug, {
    name: string;
    nickname: string;
    handle: string;
    role: string;
    tagline: string;
    gradient: string;
    initials: string;
    github: string;
    githubUser: string;
    linkedin: string;
    bio: string[];
    responsibilities: string[];
    techStack: string[];
    roleIcon: React.ComponentType<{ className?: string }>;
}> = {
    jay: {
        name: 'I Nyoman Widiyasa Jayananda',
        nickname: 'Jay',
        handle: 'Schryzon',
        role: 'Backend Engineer & SysAdmin',
        tagline: 'Building the engine that powers 3Dēx.',
        gradient: 'from-violet-500 to-purple-700',
        initials: 'JY',
        github: 'https://github.com/Schryzon',
        githubUser: 'Schryzon',
        linkedin: 'https://www.linkedin.com/in/schryzon/',
        roleIcon: Server,
        bio: [
            'Jay is the backbone of 3Dēx. As the primary backend engineer and system administrator, he designed and built the entire API layer — from authentication and role-based access control, to model management, payment integration with Midtrans, and the admin moderation system.',
            'He also manages the cloud infrastructure, deployment pipelines (Docker, PM2), and the MinIO file storage system that serves all 3D assets and user media on the platform.',
        ],
        responsibilities: [
            'RESTful API design and implementation (Express + TypeScript)',
            'PostgreSQL database modeling with Prisma ORM',
            'JWT authentication and role-based access control',
            'MinIO / S3-compatible file storage integration',
            'Midtrans payment gateway integration',
            'Docker containerization and deployment workflows',
            'Admin moderation and analytics backend endpoints',
        ],
        techStack: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'Prisma', 'MinIO', 'Docker', 'JWT', 'Midtrans'],
    },

    mahesa: {
        name: 'I Kadek Mahesa Permana Putra',
        nickname: 'Mahesa',
        handle: 'Vuxyn',
        role: 'Frontend Engineer & UI/UX',
        tagline: 'Every pixel of 3Dēx, crafted with intent.',
        gradient: 'from-amber-400 to-orange-500',
        initials: 'MP',
        github: 'https://github.com/Vuxyn',
        githubUser: 'Vuxyn',
        linkedin: 'https://www.linkedin.com/in/i-kadek-mahesa-permana-putra-655184320/',
        roleIcon: Palette,
        bio: [
            'Mahesa is responsible for the look, feel, and usability of 3Dēx. He designed and implemented the full frontend architecture using Next.js and Tailwind CSS — including the design system, component library, and every page you interact with on the platform.',
            'His work spans from the landing page and catalog UI, to complex interactive features like the community feed, user profiles with live banner editing, collection management, and the multi-step 3D model upload flow.',
        ],
        responsibilities: [
            'Frontend architecture with Next.js App Router',
            'Design system and component library (Tailwind CSS)',
            'User profile system with live image editing',
            'Catalog, community feed, and collection UI',
            'Multi-step model upload flow',
            'Mobile-responsive layouts across all pages',
            'SEO metadata and semantic HTML structure',
            'UI/UX decisions and interaction design',
        ],
        techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Lucide Icons', 'React Query', 'React Hot Toast'],
    },

    thoriq: {
        name: 'Thoriq Abdillah Falian Kusuma',
        nickname: 'Thoriq',
        handle: 'ganijack',
        role: 'Frontend Engineer & Integration',
        tagline: 'Connecting the dots between frontend and backend.',
        gradient: 'from-teal-400 to-cyan-600',
        initials: 'TF',
        github: 'https://github.com/ganijack',
        githubUser: 'ganijack',
        linkedin: 'https://www.linkedin.com/in/thoriq-abdillah-falian-kusuma-433615289/',
        roleIcon: Plug,
        bio: [
            'Thoriq bridges the frontend and backend of 3Dēx. He focuses on implementing feature integrations — ensuring that UI components correctly communicate with the API layer, handling real data flows and user-facing logic across the application.',
            'His work includes the cart and checkout flow with Midtrans payment simulation, the print services marketplace, provider listings, and various frontend features that required careful coordination between client state and server responses.',
        ],
        responsibilities: [
            'Cart and checkout flow implementation',
            'Midtrans client-side payment integration',
            'Print services marketplace and provider pages',
            'Frontend API service layer and data fetching',
            'Order management and tracking UI',
            'Feature integration testing and debugging',
            'Frontend-backend contract alignment',
        ],
        techStack: ['Next.js', 'React', 'TypeScript', 'Axios', 'React Query', 'Tailwind CSS', 'Midtrans SDK'],
    },
};

export async function generateMetadata({ params }: { params: Promise<{ member: string }> }): Promise<Metadata> {
    const { member } = await params;
    const data = memberData[member as MemberSlug];
    if (!data) return { title: 'Not Found' };
    return {
        title: `${data.nickname} — ${data.role}`,
        description: `Meet ${data.name} (${data.handle}), ${data.role} at 3Dēx.`,
    };
}

export default async function MemberPage({ params }: { params: Promise<{ member: string }> }) {
    const { member } = await params;
    const data = memberData[member as MemberSlug];
    if (!data) notFound();

    const RoleIcon = data.roleIcon;

    return (
        <div className="min-h-screen bg-[#080808] text-white">
            {/* Top Nav */}
            <nav className="sticky top-0 z-50 bg-[#080808]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/about-us" className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
                            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <img src="/3Dex.svg" alt="3Dēx" className="w-6 h-6 outline outline-1 outline-white/10 rounded-full" />
                                <span className="font-black text-lg tracking-tighter">3Dēx</span>
                            </Link>
                            <span className="text-white/20">/</span>
                            <span className="text-sm font-medium text-white/60">{data.nickname}</span>
                        </div>
                    </div>
                    <Link
                        href="/catalog"
                        className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-yellow-400 transition-colors hidden sm:block"
                    >
                        Explore Catalog
                    </Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 pt-16 pb-28 space-y-16">

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-8 md:items-end">
                    {/* Avatar */}
                    <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${data.gradient} overflow-hidden flex items-center justify-center text-4xl font-black text-white shrink-0 shadow-2xl relative`}>
                        <div className="absolute inset-0 bg-black/5" />
                        <img src={`https://github.com/${data.githubUser}.png`} alt={data.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <RoleIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{data.role}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1">{data.nickname}</h1>
                        <p className="text-white/40 text-sm mb-3">{data.name}</p>
                        <p className={`text-base font-medium bg-gradient-to-r ${data.gradient} bg-clip-text text-transparent mb-6`}>
                            "{data.tagline}"
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href={data.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-xl text-sm font-medium hover:bg-[#005582] transition-all"
                            >
                                View LinkedIn
                                <ExternalLink className="w-3 h-3 text-white/50" />
                            </a>
                            <a
                                href={data.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
                            >
                                <Github className="w-4 h-4" />
                                @{data.githubUser}
                                <ExternalLink className="w-3 h-3 text-white/30" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <section>
                    <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                        <span className="w-6 h-px bg-yellow-400 block" />
                        About
                    </h2>
                    <div className="space-y-4">
                        {data.bio.map((para, i) => (
                            <p key={i} className="text-white/60 leading-relaxed text-[15px]">{para}</p>
                        ))}
                    </div>
                </section>

                {/* Responsibilities */}
                <section>
                    <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                        <span className="w-6 h-px bg-yellow-400 block" />
                        Responsibilities
                    </h2>
                    <ul className="space-y-3">
                        {data.responsibilities.map(item => (
                            <li key={item} className="flex items-start gap-3 text-[15px] text-white/60">
                                <ChevronRight className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Tech Stack */}
                <section>
                    <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                        <span className="w-6 h-px bg-yellow-400 block" />
                        Tech Stack
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {data.techStack.map(tech => (
                            <span
                                key={tech}
                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white/70"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Meet the rest of the team */}
                <section>
                    <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                        <span className="w-6 h-px bg-yellow-400 block" />
                        Meet the Team
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {(Object.entries(memberData) as [MemberSlug, typeof memberData[MemberSlug]][])
                            .filter(([slug]) => slug !== member)
                            .map(([slug, m]) => (
                                <Link
                                    key={slug}
                                    href={`/about-us/${slug}`}
                                    className="flex items-center gap-4 p-4 bg-[#111] border border-white/10 rounded-2xl hover:border-white/20 transition-all group"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} overflow-hidden shrink-0 relative`}>
                                        <div className="absolute inset-0 bg-black/5" />
                                        <img src={`https://github.com/${m.githubUser}.png`} alt={m.nickname} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold">{m.nickname}</p>
                                        <p className="text-xs text-gray-500 truncate">{m.role}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                                </Link>
                            ))}
                    </div>
                </section>

            </div>
        </div>
    );
}

export function generateStaticParams() {
    return [
        { member: 'jay' },
        { member: 'mahesa' },
        { member: 'thoriq' },
    ];
}
