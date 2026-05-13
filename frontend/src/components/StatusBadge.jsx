export default function StatusBadge({ status, type = "stock" }) {
  const styles = {
    AMAN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    MENIPIS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    HABIS: "bg-red-500/10 text-red-400 border-red-500/20",
    TERSEDIA: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    MENDEKATI_KEDALUWARSA: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    KEDALUWARSA: "bg-red-500/10 text-red-400 border-red-500/20",
    ACTIVE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    INACTIVE: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    UNKNOWN: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  const dotStyles = {
    AMAN: "bg-emerald-400",
    MENIPIS: "bg-amber-400",
    HABIS: "bg-red-400",
    TERSEDIA: "bg-emerald-400",
    MENDEKATI_KEDALUWARSA: "bg-amber-400",
    KEDALUWARSA: "bg-red-400",
    ACTIVE: "bg-blue-400",
    INACTIVE: "bg-zinc-400",
    UNKNOWN: "bg-zinc-400",
  };

  const labelMap = {
    AMAN: "Aman",
    MENIPIS: "Menipis",
    HABIS: "Habis",
    TERSEDIA: "Tersedia",
    MENDEKATI_KEDALUWARSA: "Hampir Exp",
    KEDALUWARSA: "Expired",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
  };

  let currentStatus = status;
  if (type === "active") currentStatus = status ? "ACTIVE" : "INACTIVE";
  
  const styleClass = styles[currentStatus] || styles.UNKNOWN;
  const dotClass = dotStyles[currentStatus] || dotStyles.UNKNOWN;
  const label = labelMap[currentStatus] || currentStatus || "Unknown";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styleClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
      {label}
    </span>
  );
}
