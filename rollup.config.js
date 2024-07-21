import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts', // Entry point of your application
  output: {
    file: 'dist/bundle.js',
    format: 'cjs', // or 'esm' for ES module
  },
  plugins: [
    typescript()
  ]
};
