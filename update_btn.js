const fs = require('fs');

const filepath = 'frontend/src/components/ProfileDropdown.jsx';
let content = fs.readFileSync(filepath, 'utf8');

// The perfect button structure
const buttonStyle = `className="w-full flex items-center justify-center gap-2 mt-4"
                style={{
                  padding: '11px 24px',
                  background: '#E1FF01',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '12px',
                  color: '#18181B',
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.2px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 4px 14px rgba(225,255,1,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#E9FF3D'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(225,255,1,0.25), inset 0 1px 0 rgba(255,255,255,0.6)'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#E1FF01'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(225,255,1,0.15), inset 0 1px 0 rgba(255,255,255,0.5)'; }}
                onMouseDown={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#C7E600'; e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}}
                onMouseUp={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#E9FF3D'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(225,255,1,0.25), inset 0 1px 0 rgba(255,255,255,0.6)'; }}}`;

// 1. Replace the Profil button
content = content.replace(
  /className="w-full bg-\[#E1FF01\] hover:bg-\[#c7e600\] text-zinc-900 font-bold rounded-xl py-3 text-sm transition-all shadow-\[0_0_20px_rgba\(225,255,1,0\.2\)\] hover:shadow-\[0_0_30px_rgba\(225,255,1,0\.4\)\] hover:-translate-y-0\.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"/g,
  buttonStyle
);

// 2. Replace the Password button & Email button (mt-4 version)
content = content.replace(
  /className="w-full bg-\[#E1FF01\] hover:bg-\[#c7e600\] text-zinc-900 font-bold rounded-xl py-3 text-sm transition-all shadow-\[0_0_20px_rgba\(225,255,1,0\.2\)\] hover:shadow-\[0_0_30px_rgba\(225,255,1,0\.4\)\] hover:-translate-y-0\.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-4"/g,
  buttonStyle
);

// 3. Fix the "Password" tab inputs
content = content.replace(
  /className="w-full bg-\[#0a0a0b\] border border-white\/\[0\.08\] focus:border-\[#E1FF01\]\/50 text-white rounded-lg px-3 py-2\.5 text-sm outline-none transition-colors"/g,
  'className="w-full bg-black/40 border border-white/10 focus:border-[#E1FF01]/50 focus:ring-2 focus:ring-[#E1FF01]/20 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all"'
);

// 4. Fix the "Email" tab inputs
// First input in Email (which already partially updated)
content = content.replace(
  /className="w-full bg-black\/40 border border-white\/10 focus:border-\[#E1FF01\]\/50 focus:ring-2 focus:ring-\[#E1FF01\]\/20 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-zinc-600"/g,
  'className="w-full bg-black/40 border border-white/10 focus:border-[#E1FF01]/50 focus:ring-2 focus:ring-[#E1FF01]/20 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-zinc-600"'
);

// Second input in Email (passEmail) which still has old style
content = content.replace(
  /className="w-full bg-\[#0a0a0b\] border border-white\/\[0\.08\] focus:border-\[#E1FF01\]\/50 text-white rounded-lg px-3 py-2\.5 text-sm outline-none transition-colors"/g,
  'className="w-full bg-black/40 border border-white/10 focus:border-[#E1FF01]/50 focus:ring-2 focus:ring-[#E1FF01]/20 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-zinc-600"'
);

// 5. Fix the Badge Role & "Email saat ini" info boxes
content = content.replace(
  /<div className="flex items-center justify-between px-3 py-2\.5 bg-white\/\[0\.03\] border border-white\/\[0\.06\] rounded-xl">/g,
  '<div className="flex items-center justify-between px-4 py-3 bg-black/40 border border-white/10 rounded-xl mb-4">'
);

fs.writeFileSync(filepath, content);
console.log('Update button consistency finished');
