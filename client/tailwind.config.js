/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: "rgba(255, 255, 255, 0.12)",
          "bg-hover": "rgba(255, 255, 255, 0.18)",
          "bg-strong": "rgba(255, 255, 255, 0.22)",
          border: "rgba(255, 255, 255, 0.2)",
          "border-hover": "rgba(255, 255, 255, 0.35)",
          text: "rgba(255, 255, 255, 1)",
          "text-secondary": "rgba(255, 255, 255, 0.7)",
          "text-muted": "rgba(255, 255, 255, 0.5)",
          overlay: "rgba(0, 0, 0, 0.4)",
        },
      },
      backdropBlur: {
        xs: "2px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "40px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.2)",
        "glass-lg": "0 12px 48px rgba(0, 0, 0, 0.4)",
        "glass-inset": "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
        glow: "0 0 20px rgba(245, 158, 11, 0.3)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      animation: {
        "bg-shift": "bgShift 20s ease infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
      },
      keyframes: {
        bgShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
