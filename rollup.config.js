import nodeResolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"

export default {
   input: [
      "src/generate.ts"
   ],
   output: {
      file: "build/generate.js",
      format: "es"
   },
   plugins: [
      typescript({
         target: "es2022",
         exclude: ["/dist/**"]
      }),
      nodeResolve()
   ]
}
