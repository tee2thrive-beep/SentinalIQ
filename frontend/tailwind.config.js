/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: "#090d16",
          card: "#111827",
          border: "#1f293d",
          hover: "#1e293b",
          primary: "#3b82f6",
          critical: "#f43f5e",
          high: "#f97316",
          medium: "#eab308",
          low: "#06b6d4"
        }
      }
    },
  },
  plugins: [],
}
