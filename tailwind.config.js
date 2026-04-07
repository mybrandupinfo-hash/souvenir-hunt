/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff7ff",
          100: "#dcecff",
          200: "#bddcff",
          300: "#8dc3ff",
          400: "#54a6ff",
          500: "#2588ff",
          600: "#0a6cff",
          700: "#0057e6",
          800: "#0b4abe",
          900: "#123f99",
        },
      },
      boxShadow: {
        soft: "0 20px 70px rgba(37, 136, 255, 0.10)",
        card: "0 20px 60px rgba(15, 23, 42, 0.06)",
        glass: "0 24px 80px rgba(13, 108, 255, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top center, rgba(37,136,255,0.18), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,247,255,0.96) 45%, rgba(255,255,255,1))",
      },
    },
  },
  plugins: [],
};
