export default function Loading() {
  return (
    <div className="flex-1 bg-premium-gradient flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner animasi biar keliatan premium */}
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-zinc-400 font-medium animate-pulse">Sabar ya, lagi ngambil data...</p>
      </div>
    </div>
  );
}
