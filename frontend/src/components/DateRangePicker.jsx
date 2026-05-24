"use client";
import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const MAX_RANGE_DAYS = 7;

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function diffDays(a, b) {
  const msPerDay = 86400000;
  return Math.round(Math.abs(new Date(a) - new Date(b)) / msPerDay);
}

export default function DateRangePicker({ from, to, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (from) return new Date(from + "T00:00:00");
    return new Date();
  });
  const [selecting, setSelecting] = useState(null); // null | "from" picked, waiting for "to"
  const [tempFrom, setTempFrom] = useState(from || "");
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync props
  useEffect(() => {
    setTempFrom(from || "");
  }, [from]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day) => {
    const clicked = toDateStr(new Date(year, month, day));

    if (!selecting) {
      // First click — set "from"
      setTempFrom(clicked);
      setSelecting("waitEnd");
    } else {
      // Second click — set "to"
      let f = tempFrom;
      let t = clicked;
      if (t < f) [f, t] = [t, f];

      // Enforce max 7 days
      if (diffDays(f, t) > MAX_RANGE_DAYS - 1) {
        const maxEnd = new Date(new Date(f + "T00:00:00").getTime() + (MAX_RANGE_DAYS - 1) * 86400000);
        t = toDateStr(maxEnd);
      }

      onChange(f, t);
      setSelecting(null);
      setOpen(false);
    }
  };

  const isInRange = (day) => {
    const d = toDateStr(new Date(year, month, day));
    const f = from || tempFrom;
    const t = to;
    if (f && t) return d >= f && d <= t;
    return false;
  };

  const isStart = (day) => {
    const d = toDateStr(new Date(year, month, day));
    return d === (from || tempFrom);
  };

  const isEnd = (day) => {
    const d = toDateStr(new Date(year, month, day));
    return d === to;
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Check if day would exceed max range from tempFrom
  const isDisabled = (day) => {
    if (!selecting) return false;
    const d = toDateStr(new Date(year, month, day));
    const dist = diffDays(tempFrom, d);
    return dist > MAX_RANGE_DAYS - 1;
  };

  const displayText = from && to
    ? `${formatDisplay(from)}  –  ${formatDisplay(to)}`
    : from
      ? `${formatDisplay(from)}  –  ...`
      : "Pilih Rentang Tanggal";

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setSelecting(null);
        }}
        className="flex items-center justify-center gap-2 bg-[#131315] px-3 h-[38px] rounded-xl border border-white/[0.05] text-xs text-white hover:bg-white/[0.03] transition-colors"
      >
        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
        <span className={from ? "text-white" : "text-zinc-500"}>{displayText}</span>
      </button>

      {/* Dropdown Calendar */}
      {open && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-[#1a1a1d] border border-white/[0.08] rounded-2xl shadow-2xl p-4 w-[300px] animate-fade-in-up">
          {/* Selected Range Display */}
          {(from || tempFrom) && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[10px] text-zinc-500 mb-1">Rentang Terpilih</p>
              <p className="text-xs text-white">
                {from && to
                  ? `${formatDisplay(from)} ~ ${formatDisplay(to)}`
                  : `${formatDisplay(tempFrom)} ~ ...`}
              </p>
            </div>
          )}

          {/* Month Nav */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white">
              {BULAN[month]} {year}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-1">
            {HARI.map((h) => (
              <div key={h} className="text-center text-[10px] font-bold text-zinc-500 py-1">
                {h}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for offset */}
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const inRange = isInRange(day);
              const start = isStart(day);
              const end = isEnd(day);
              const today = isToday(day);
              const disabled = isDisabled(day);

              return (
                <div
                  key={day}
                  className={`relative flex items-center justify-center ${
                    inRange && !start && !end ? "bg-[#E1FF01]/10" : ""
                  } ${start ? "rounded-l-full bg-[#E1FF01]/10" : ""} ${
                    end ? "rounded-r-full bg-[#E1FF01]/10" : ""
                  }`}
                >
                  <button
                    onClick={() => !disabled && handleDayClick(day)}
                    disabled={disabled}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all flex items-center justify-center ${
                      start || end
                        ? "bg-[#E1FF01] text-[#131315] font-bold"
                        : disabled
                          ? "text-zinc-700 cursor-not-allowed"
                          : today
                            ? "text-[#E1FF01] font-bold hover:bg-[#E1FF01]/20"
                            : "text-zinc-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between">
            <p className="text-[10px] text-zinc-500">Max 7 hari</p>
            {selecting && (
              <p className="text-[10px] text-[#E1FF01] animate-pulse">Pilih tanggal akhir</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
