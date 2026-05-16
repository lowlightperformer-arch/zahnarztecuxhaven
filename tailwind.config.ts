import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#123A63',
        'accent-blue': '#2F80ED',
        'light-bg': '#F4F8FC',
        'status-green': '#2EAF67',
      },
      maxWidth: {
        app: '1200px',
      },
    },
  },
  plugins: [typography],
}

export default config