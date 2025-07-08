// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'Module/APIService.js', // entry point to your module
    output: {
        file: 'dist/turtl-js-api.mjs',
        format: 'es',
        sourcemap: true
    },
    plugins: [nodeResolve(), commonjs()]
};
