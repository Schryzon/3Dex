'use client';

const TOOLS = [
    { name: 'Blender',        icon: '⬡' },
    { name: 'Autodesk Maya',  icon: '◈' },
    { name: 'Cinema 4D',      icon: '◉' },
    { name: 'Unreal Engine',  icon: '◆' },
    { name: 'Unity',          icon: '◇' },
    { name: 'ZBrush',         icon: '⬢' },
    { name: 'Houdini',        icon: '◎' },
    { name: '3ds Max',        icon: '▣' },
];

const TOOLS_LOOP = [...TOOLS, ...TOOLS, ...TOOLS];

export default function SocialProof() {
    return (
        <div className="relative bg-[#080808] overflow-hidden py-6">

            {/* Top border — subtle yellow tint */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

            {/* Fade edges — outside overflow-hidden wrapper so they're not clipped */}
            <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#080808] via-[#080808]/80 to-transparent z-10 pointer-events-none" />

            {/* Constrained layout */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 relative overflow-hidden">

                {/* "Works with" label */}
                <div className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-start gap-0.5">
                    <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-yellow-400/50">Works</span>
                    <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-yellow-400/50">with</span>
                </div>

                {/* Scrolling track */}
                <div
                    className="flex gap-8 items-center whitespace-nowrap"
                    style={{
                        animation: 'marquee 32s linear infinite',
                        width: 'max-content',
                        paddingLeft: '180px',
                    }}
                >
                    {TOOLS_LOOP.map((tool, i) => (
                        <div
                            key={i}
                            className="group flex items-center gap-2.5 shrink-0 px-4 py-1.5 rounded-full border border-white/[0.04] hover:border-yellow-400/20 hover:bg-yellow-400/[0.03] transition-all duration-300 cursor-default"
                        >
                            <span className="text-yellow-400/30 group-hover:text-yellow-400/60 transition-colors text-xs leading-none">
                                {tool.icon}
                            </span>
                            <span className="text-[13px] font-medium tracking-wide text-gray-600 group-hover:text-gray-300 transition-colors">
                                {tool.name}
                            </span>
                        </div>
                    ))}
                </div>

            </div>

            <style>{`
                @keyframes marquee {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
            `}</style>
        </div>
    );
}