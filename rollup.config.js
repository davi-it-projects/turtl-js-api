import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "Module/index.js",
    output: {
      file: "dist/turtl-js-api.mjs",
      format: "es",
      sourcemap: true,
    },
    plugins: [nodeResolve(), commonjs()],
  },
  {
    input: "dist/types/index.d.ts",
    output: {
      file: "dist/turtl-js-api.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
