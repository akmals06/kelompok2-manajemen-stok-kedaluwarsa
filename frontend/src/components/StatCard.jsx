export default function StatCard({ title, value, subtitle, icon, color = "lime", delay = 0 }) {
  const colorMap = {
    lime: {
      icon: "bg-[#E1FF01]/[0.08] text-[#E1FF01] border-[#E1FF01]/30",
      glow: "hover:shadow-[0_0_25px_rgba(225,255,1,0.08)]",
    },
    emerald: {
      icon: "bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/30",
      glow: "hover:shadow-[0_0_25px_rgba(52,211,153,0.08)]",
    },
    amber: {
      icon: "bg-amber-500/[0.08] text-amber-400 border-amber-500/30",
      glow: "hover:shadow-[0_0_25px_rgba(251,191,36,0.08)]",
    },
    red: {
      icon: "bg-red-500/[0.08] text-red-400 border-red-500/30",
      glow: "hover:shadow-[0_0_25px_rgba(248,113,113,0.08)]",
    },
    blue: {
      icon: "bg-blue-500/[0.08] text-blue-400 border-blue-500/30",
      glow: "hover:shadow-[0_0_25px_rgba(96,165,250,0.08)]",
    },
  };

  const scheme = colorMap[color] || colorMap.lime;

  return (
    <div
      className={`glass-card-hover p-5 sm:p-6 group flex flex-col items-start animate-fade-in-up transition-all duration-300 ${scheme.glow} relative overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon Squircle */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 mb-4 ${scheme.icon}`}>
        {icon}
      </div>

      <div className="flex flex-col gap-1 w-full">
        {/* Large Number */}
        <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-heading leading-none mb-1">
          {value}
        </div>
        
        {/* Title */}
        <h3 className="text-sm font-semibold text-zinc-300 tracking-wide">{title}</h3>
        
        {/* Subtitle */}
        {subtitle && <span className="text-[11px] text-zinc-500 font-medium">{subtitle}</span>}
      </div>
    </div>
  );
}
