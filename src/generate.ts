import { mkdir, readdir, readFile, writeFile } from "fs/promises"
import config from "../config.js"
import { coalesceArr, coalesceObj, forArrAsync, forObj, forObjAsync, forArr, mergeDeep } from '../util/util';

interface GenerationConfig {
   input: Record<string, string>
   getSpriteOutputs: (state: { input: string, path: string }) => Array<string>
   getEnumOutputs: (state: { input: string, path: string }) => Array<{ path: string, name: string }>
   getSvgId: (state: { fileName: string, data: string }) => string
   getSpriteName: (state: { input: string, output: string, fileName: string, svgId: string, data: string }) => string
   getEnumName: (state: { input: string, output: { path: string, name: string }, fileName: string, svgId: string, data: string }) => string
   includeViewBox: boolean
   includeDimensions: boolean
   indentSize: number
   extractData: (state: { input: string, fileName: string, svgId: string, data: string }) => string
   extractViewBox: (state: { input: string, fileName: string, svgId: string, data: string }) => string
   extractDimensions: (state: { input: string, fileName: string, svgId: string, data: string }) => string
   getSvgTag: (state: { path: string }) => string
}

type CommonState = {
   input: string
   path: string
   output: string | { path: string, name: string }
   fileName: string
   data: string
   svgId: string
}

type EnumState = CommonState & {
   output: { path: string, name: string }
}

type SpriteState = CommonState & {
   output: string
}

const started = Date.now()

const opts = mergeDeep({
   getSpriteOutputs({ input, path }) {
      return [input]
   },
   getEnumOutputs({ input, path }) {
      return [input]
   },
   getSvgId({ fileName, data }) {
      return data.match(/(?<=id=")[\w|-]*(?<!")/gm)?.[0]
   },
   getSpriteName({ input, output, fileName, svgId, data }) {
      return svgId
   },
   getEnumName({ input, output, fileName, svgId, data }) {
      return fileName.split("-").map(v => v[0].toUpperCase() + v.slice(1)).join("")
   },
   includeViewBox: true,
   includeDimensions: false,
   indentSize: 3,
   extractData({ input, fileName, svgId, data }) {
      return data.match(/(?<=<svg[^<]*>).*(?=<\/svg>)/gm).join()
   },
   extractViewBox({ input, fileName, svgId, data }) {
      return data.match(/viewBox="[\d| ]*"/gm).join()
   },
   extractDimensions({ input, fileName, svgId, data }) {
      return data.match(/(width|height)="[\d]*"/gm).join(" ")
   },
   getSvgTag({ path }) {
      return "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xml:space=\"preserve\">"
   }
}, config) as GenerationConfig

const enumChunks: Record<string, Record<string, string>> = {}
const spriteChunks: Record<string, string> = {}

await forObjAsync(opts.input, async (inputPath, inputId) => {
   const inputDir = await readdir(`${inputPath}`)
   await forArrAsync(inputDir, async (fullFilePath, i) => {
      const filePath = fullFilePath.split(".")[0]
      const state = {
         input: inputId,
         path: filePath
      } as CommonState
      const spriteOutputs = opts.getSpriteOutputs(state as SpriteState)
      const enumOutputs = opts.getEnumOutputs(state as EnumState)
      if (!spriteOutputs.length || !enumOutputs.length) return
      //! check if folder
      const fileContents = (await readFile(`${inputPath}/${fullFilePath}`)).toString()
      state.fileName = filePath
      state.data = fileContents
      const svgId = opts.getSvgId(state)
      state.svgId = svgId

      forArr(spriteOutputs, (spriteOutput) => {
         const spriteName = opts.getSpriteName(state as SpriteState)
         const data = opts.extractData(state)
         const viewBox = opts.includeViewBox
            ? opts.extractViewBox(state)
            : false
         const dimensions = opts.includeDimensions
            ? opts.extractDimensions(state)
            : false
         const dim1 = dimensions ? dimensions.split(" ")[0] : false
         const dim2 = dimensions ? dimensions.split(" ")[1] : false

         let sprite = "<symbol "
         sprite += `id="${spriteName}" `
         if (viewBox) sprite += `${viewBox} `
         if (dim1) sprite += `${dim1} `
         if (dim2) sprite += `${dim2} `
         sprite = sprite.slice(0, -1) + `>${data}</symbol>`

         spriteChunks[spriteOutput] += sprite
      }, false)

      forArr(enumOutputs, (enumOutput) => {
         const { path, name } = enumOutput
         state.output = enumOutput
         const spriteName = opts.getSpriteName(state as SpriteState)
         const enumName = opts.getEnumName(state as EnumState)
         if (!enumChunks[path]) enumChunks[path] = {}
         if (!enumChunks[path][name]) enumChunks[path][name] = ""
         enumChunks[path][name] += `${" ".repeat(opts.indentSize)}${enumName} = "${spriteName}",\n`
      }, false)
   }, false)
}, false)
   
await forObjAsync(spriteChunks, async (fileContent, spriteOutputPath) => {
   const tag = opts.getSvgTag({ path: spriteOutputPath })
   if (spriteOutputPath.includes("/")) {
      await mkdir(spriteOutputPath.split("/").slice(0, -1).join("/"), { recursive: true })
   }
   await writeFile(spriteOutputPath, tag + fileContent + "</svg>")
}, false)
   
await forObjAsync(enumChunks, async (enumNames, enumOutputPath) => {
   const enumFile = coalesceObj(enumNames, "", (fileContent, v, enumName) => {
      return v + `export enum ${enumName} {\n${fileContent.slice(0, -2)}\n}\n\n`
   }, v => v.slice(0, -1))
   if (enumOutputPath.includes("/")) {
      await mkdir(enumOutputPath.split("/").slice(0, -1).join("/"), { recursive: true })
   }
   await writeFile(enumOutputPath, enumFile)
}, false)

console.log(`Completed in ${((Date.now() - started) / 1000).toFixed(2)}s`)
