/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layout/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#0f172a",
        secondary: "#64748b",
        lime: {
          accent: '#E1FF01',
          300: '#F0FF73',
          400: '#E9FF3D',
          500: '#E1FF01',
          600: '#C7E600',
        },
        surface: {
          base: '#18181B',
          card: '#27272A',
          elevated: '#3F3F46',
          overlay: '#52525C',
        },
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
