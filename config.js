export default {
   input: {
      MDI: "svg"
   },
   getSpriteOutputs({ input, path, outputs }) {
      return path.includes("outline") ? ["dist/icons.svg"] : []
   },
   getEnumOutputs({ input, path, outputs }) {
      return path.includes("outline") ? [{
         path: "dist/Icons.ts",
         name: "MDISprites"
      }] : []
   },
   getSvgId({ fileName, data }) {
      return data.match(/(?<=id=")[\w|-]*(?<!")/gm)?.[0].replace("mdi-", "")
   },
   includeViewBox: true,
   includeDimensions: false,
   indentSize: 3
}
