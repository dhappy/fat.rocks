module.exports = (ctx) => {
  console.info('HERE!!!')
  
  return ({
  map: 'inline',
  plugins: {
    'postcss-import': {},
    'postcss-nested-props': true,
    'tailwindcss/nesting': true,
    tailwindcss: {},
    autoprefixer: {},
  },
})
}