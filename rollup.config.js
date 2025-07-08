// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'Module/index.js', // new entry
    output: {
        file: 'dist/turtl-js-api.mjs',
        format: 'es',
        sourcemap: true
    },
    plugins: [nodeResolve(), commonjs()]
};