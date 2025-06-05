import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Dark mode enabled by default via class
  theme: {
    extend: {
      colors: {
        // Golf Pass brand colors
        "fairway": {
          DEFAULT: "#2a9d8f",
          50: "#f0f9f8",
          100: "#d4f0ed",
          200: "#a9e1db",
          300: "#7dcdc4",
          400: "#52b9ae",
          500: "#2a9d8f", // Primary
          600: "#208177",
          700: "#1a655e",
          800: "#164d47",
          900: "#11403b",
          950: "#0a2724",
        },
        "light-green": {
          DEFAULT: "#8ece9a",
          50: "#f5fbf6",
          100: "#e9f6ec",
          200: "#d3ecd9",
          300: "#b0dfbb",
          400: "#8ece9a", // Secondary
          500: "#69ba79",
          600: "#4e9e5e",
          700: "#3e7d4b",
          800: "#34653f",
          900: "#2c5435",
          950: "#162f1d",
        },
        "sand": {
          DEFAULT: "#e9c46a",
          50: "#fefaec",
          100: "#fcf3d0",
          200: "#f8e7a1",
          300: "#f2d768",
          400: "#e9c46a", // Neutral
          500: "#e0a83b",
          600: "#cd8a25",
          700: "#a96b1f",
          800: "#8a5520",
          900: "#74461d",
          950: "#422611",
        },
        "luxury": {
          DEFAULT: "#f4a261",
          50: "#fef6ee",
          100: "#fdead7",
          200: "#fad3ae",
          300: "#f7b77b",
          400: "#f4a261", // Premium
          500: "#ef7e31",
          600: "#e05e1a",
          700: "#ba4815",
          800: "#963a17",
          900: "#7b3216",
          950: "#421709",
        },
        "accent": {
          DEFAULT: "#e76f51",
          50: "#fdf3f0",
          100: "#fbe5de",
          200: "#f7c9bc",
          300: "#f1a390",
          400: "#e76f51", // Call-to-action
          500: "#e04f2c",
          600: "#cc3a1f",
          700: "#a82e1c",
          800: "#89281d",
          900: "#722619",
          950: "#3e110c",
        },
        "dark-blue": {
          DEFAULT: "#1d3557",
          50: "#f2f5fa",
          100: "#e3e9f3",
          200: "#c0cfe5",
          300: "#8fa8d0",
          400: "#5a7db5",
          500: "#3b5d9a",
          600: "#2d4a7f",
          700: "#263d67",
          800: "#1d3557", // Dark mode
          900: "#1a2e4a",
          950: "#111c2d",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        display: ["var(--font-playfair)", ...fontFamily.serif],
      },
      borderRadius: {
        "glassmorphic": "1rem", // 16px as specified in PRD
      },
      boxShadow: {
        "glassmorphic": "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "glassmorphic-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.25)",
        "glassmorphic-hover": "0 12px 36px 0 rgba(31, 38, 135, 0.25)",
        "glassmorphic-dark-hover": "0 12px 36px 0 rgba(0, 0, 0, 0.35)",
      },
      backdropBlur: {
        "glassmorphic": "12px",
      },
      backdropSaturate: {
        "glassmorphic": "160%",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "slide-left": "slideLeft 0.5s ease-out",
        "slide-right": "slideRight 0.5s ease-out",
        "bounce-slow": "bounce 3s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-glassmorphic": "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)",
        "gradient-glassmorphic-dark": "linear-gradient(135deg, rgba(20, 20, 20, 0.2) 0%, rgba(20, 20, 20, 0.05) 100%)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--tw-prose-body)',
            '[class~="lead"]': {
              color: 'var(--tw-prose-lead)',
            },
            a: {
              color: '#2a9d8f',
              textDecoration: 'underline',
              textDecorationColor: '#2a9d8f40',
              fontWeight: '500',
              '&:hover': {
                color: '#208177',
                textDecorationColor: '#20817780',
              },
            },
            h1: {
              fontFamily: 'var(--font-playfair)',
            },
            h2: {
              fontFamily: 'var(--font-playfair)',
            },
            h3: {
              fontFamily: 'var(--font-playfair)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    function({ addUtilities }) {
      const newUtilities = {
        '.backdrop-blur-glassmorphic': {
          'backdrop-filter': 'blur(12px) saturate(160%)',
        },
        '.backdrop-blur-glassmorphic-light': {
          'backdrop-filter': 'blur(8px) saturate(140%)',
        },
        '.backdrop-blur-glassmorphic-heavy': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
        },
        '.bg-glassmorphic': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(12px) saturate(160%)',
          'border': '1px solid rgba(255, 255, 255, 0.18)',
          'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        },
        '.bg-glassmorphic-dark': {
          'background': 'rgba(20, 20, 20, 0.1)',
          'backdrop-filter': 'blur(12px) saturate(160%)',
          'border': '1px solid rgba(20, 20, 20, 0.18)',
          'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        },
        '.text-shadow-sm': {
          'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow': {
          'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-md': {
          'text-shadow': '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
        },
        '.text-shadow-lg': {
          'text-shadow': '0 15px 30px rgba(0, 0, 0, 0.11), 0 5px 15px rgba(0, 0, 0, 0.08)',
        },
        '.text-shadow-none': {
          'text-shadow': 'none',
        },
        '.hover-lift': {
          'transition': 'transform 0.3s ease-in-out',
          '&:hover': {
            'transform': 'translateY(-5px)',
          },
        },
        '.card-3d-effect': {
          'transform-style': 'preserve-3d',
          'transition': 'transform 0.3s ease',
          'perspective': '1000px',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};

export default config;
