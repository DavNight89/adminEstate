/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors - Lighter for better readability
        'dark-bg': '#0f0f23',
        'dark-surface': 'rgba(255, 255, 255, 0.12)',
        'dark-border': 'rgba(255, 255, 255, 0.2)',
        'dark-text': '#ffffff',
        'dark-text-muted': 'rgba(255, 255, 255, 0.8)',
        'dark-text-dim': 'rgba(255, 255, 255, 0.65)',
        'glass': 'rgba(255, 255, 255, 0.12)',
        'glass-hover': 'rgba(255, 255, 255, 0.15)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-success': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-info': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}