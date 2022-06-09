import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.bundle.js',
      format: 'iife',
      name: 'idnaUts46',
    },
  ],
  plugins: [
    // needed to resolve punycode from import not node's builtin
    nodeResolve({ preferBuiltins: false }),
  ],
};
