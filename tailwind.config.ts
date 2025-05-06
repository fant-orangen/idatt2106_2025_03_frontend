module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'crisis-green': 'var(--crisis-level-green)',
        'crisis-yellow': 'var(--crisis-level-yellow)',
        'crisis-red': 'var(--crisis-level-red)'
      }
    },
  },
  plugins: [],
}
