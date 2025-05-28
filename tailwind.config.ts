import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cream-beige': '#FFF8E7',
        'golden-yellow': '#F4C430',
        'chocolate-brown': '#3C2005',
        'soft-red': '#D9534F',
        'warm-white': '#FDFDFD',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        opensans: ['var(--font-opensans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
