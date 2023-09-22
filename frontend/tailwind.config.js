module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './src/views/**/*.{vue,js,ts}', './src/components/**/*.{vue,js,ts}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        echo: {
          primary: '#88d7f7',
          'primary-focus': '#54c5f2',
          'primary-content': '#201047',

          secondary: '#e679c0',
          'secondary-focus': '#e04dac',
          'secondary-content': '#201047',

          accent: '#f6d860',
          'accent-focus': '#f3cc30',
          'accent-content': '#201047',

          neutral: '#22212c',
          'neutral-focus': '#1b1c22',
          'neutral-content': '#e9e5ff',

          'base-100': '#302f3d',
          'base-200': '#22212c',
          'base-300': '#1b1c22',
          'base-content': '#e9e5ff',

          info: '#0ca6e9',
          success: '#2bd4bd',
          warning: '#f4c152',
          error: '#ff5757',

          '--rounded-box': '1rem',
          '--rounded-btn': '.5rem',
          '--rounded-badge': '1.9rem',

          '--animation-btn': '.25s',
          '--animation-input': '.2s',

          '--btn-text-case': 'uppercase',
          '--navbar-padding': '.5rem',
          '--border-btn': '1px',
        },
      },
    ],
  },
}
