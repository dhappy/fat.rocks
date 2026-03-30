module.exports = (ctx) => ({
  map: 'inline',
  plugins: {
    'postcss-import': {},
    'postcss-nested-props': true,
    'tailwindcss/nesting': true,
    tailwindcss: {},
    autoprefixer: {},
  },
})
