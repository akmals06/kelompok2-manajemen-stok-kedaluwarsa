export default function StatCard({ title, value, subtitle, icon, trend, trendValue, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-zinc-400";
  const TrendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "−";

  return (
    <div className="glass-morphism rounded-3xl p-6 flex items-start gap-4 hover:bg-white/5 transition-all duration-300 border border-white/5 shadow-xl shadow-black/20">
      {icon && (
        <div className={`p-4 rounded-2xl border ${colorMap[color]}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-3xl font-bold text-white tracking-tight">{value}</h4>
          {trendValue && (
            <span className={`text-xs font-semibold ${trendColor}`}>
              {TrendIcon} {trendValue}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
