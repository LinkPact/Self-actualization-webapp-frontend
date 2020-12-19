import { nodeResolve } from "@rollup/plugin-node-resolve";
import htmlPlugin from "rollup-plugin-html-input";

export default {
    input: "index.html",
    output: {
        format: "iife",
        dir: "./dist"
    },
    plugins: [
        htmlPlugin(),
        nodeResolve()
    ]
}