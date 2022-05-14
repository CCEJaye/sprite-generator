module.exports = {
   root: true,
   env: {
      node: true,
      commonjs: true,
      es6: true
   },
   parserOptions: {
      parser: "@typescript-eslint/parser"
   },
   extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:vue/vue3-recommended"
   ],
   globals: {
      defineProps: "readonly",
      defineEmits: "readonly",
      defineExpose: "readonly",
      withDefaults: "readonly",
      onMounted: "readonly"
   },
   rules: {
      // "vue/html-indent": ["error", 3, {
      //    baseIndent: 1
      // }],
      // "vue/script-indent": ["error", 3, {
      //    baseIndent: 1
      // }],
      quotes: ["error", "double", "avoid-escape"],
      indent: ["error", 3],
      semi: ["error", "never"],
      "semi-style": ["error", "last"],
      "no-control-regex": "off",
      "space-before-function-paren": ["error", {
         "anonymous": "never",
         "named": "never",
         "asyncArrow": "always"
      }],
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": "off",
      "no-static-element-interactions": "off",
      "vue/multi-word-component-names": "off",
      "vue/html-indent": ["error", 3, {
         attribute: 1,
         baseIndent: 1,
         closeBracket: 0,
         alignAttributesVertically: false,
         ignores: []
      }],
      "vue/max-attributes-per-line": ["error", {
         "singleline": {
            "max": 3
         },
         "multiline": {
            "max": 1
         }
      }],
      "@typescript-eslint/no-this-alias": [
         "error",
         {
            "allowDestructuring": true, // Allow `const { props, state } = this`; false by default
            "allowedNames": ["me"] // Allow `const vm= this`; `[]` by default
         }
      ],
      "no-fallthrough": "off"
      // "no-console": "off",
      // "no-tabs": "off",
      // camelcase: "off",
      // "arrow-parens": "off",
   }
}
