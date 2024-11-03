# react-native-chunks

A tool that allows you to split your bundle into several smaller chunks. This is very helpful for OTA bundles when some `shared` parts of your bundle remain unchanged (such as localizations, third-party libraries, or internationalization polyfills). It can significantly reduce your OTA bundle size. For example, see the [codepush-example](/docs/codepush-example.md), where the zipped CodePush bundle is reduced by up to 400 KB (only React Native and changed files are included in the bundle).

## Installation

### Step 1: Install the package

```sh
yarn add react-native-chunks
```

### Step 2: Add metro config

Wrap your `metro.config` into `withChunksConfig` helper

```js
const { withChunksConfig } = require('react-native-chunks/metro-config')

const config = getConfig(getDefaultConfig(__dirname), {
  // ...
})

module.exports = withChunksConfig(config)
```

### Step 3: Create chunks config file

Create `chunks.config.json` file in the root of the project.
You can check description of file config structure [here](#configuration).

```json
{
  "outputDir": "./.chunks",
  "chunks": [{
    "name": "core",
    "entryFile": "src/core/index.ts",
    "exclude": [
      "node_modules/react-native"
    ]
  }]
}
```

### Step 4: Add chunk-bundle command

#### Android
1. set `bundleCommand` as `chunk-bundle` command in the `android/app/build.gradle`

```diff
/* Bundling */
//   A list containing the node command and its flags. Default is just 'node'.
// nodeExecutableAndArgs = ["node"]
//
//   The command to run when bundling. By default is 'bundle'
-// bundleCommand = "ram-bundle"
+bundleCommand = "chunk-bundle"
//
//   The path to the CLI configuration file. Default is empty.
// bundleConfig = file(../rn-cli.config.js)
```

2. add `CHUNKS_APK_BUILD_TIME` to `defaultConfig` in the `android/app/build.gradle`

```diff
android {
    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace "chunks.example"
    defaultConfig {
        applicationId "chunks.example"
+       resValue 'string', "CHUNKS_APK_BUILD_TIME", String.format("\"%d\"", System.currentTimeMillis())
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }
```

#### iOS

In `.xcode.env` add `CLI_PATH` and `BUNDLE_COMMAND`

```diff
# This `.xcode.env` file is versioned and is used to source the environment
# used when running script phases inside Xcode.
# To customize your local environment, you can create an `.xcode.env.local`
# file that is not versioned.

+export CLI_PATH="../node_modules/react-native/cli.js"
+export BUNDLE_COMMAND="chunk-bundle"

# NODE_BINARY variable contains the PATH to the node executable.
#
# Customize the NODE_BINARY variable here.
# For example, to use nvm with brew, add the following line
# . "$(brew --prefix nvm)/nvm.sh" --no-use
export NODE_BINARY=$(command -v node)
```


## Commands

#### chunks


`chunks` builds chunks and places the output in the outputDir specified in the chunks.config.json file.

```sh
react-native chunks --platform android
```

1. You can buld only one chunk with `--chunk` 
```sh
react-native chunks --platform android --chunk core
```
2. Usually, if the hash of the dependent files has not changed, the chunks command does not rebuild chunks. You can add the `--force` flag to force it to rebuild the chunks.
```sh
react-native chunks --platform android --force
```


#### chunk-bundle

The `chunk` command builds chunks and the main bundle. It functions similarly to `react-native bundle`, but it builds the chunks before the main bundle.

```sh
react-native chunk-bundle --platform android
```

### chunks-compose-sourcemaps
The `chunks-compose-sourcemaps` command composes all sourcemaps into one.
This command collects all sourcemaps from the chunks and composes them with the provided `--bundle-sourcemap`. The output is the composed source map, which is written to the file specified in `--bundle-sourcemap-output`. If `--bundle-sourcemap-output` is not defined, the output will be written to `--bundle-sourcemap`.

```sh
yarn react-native chunks-compose-sourcemaps --platform android --bundle-sourcemap ./android/app/build/generated/sourcemaps/react/release/index.android.bundle.map
```

## Configuration
`react-native-chunks` has a configuration mechanism that allows changing its behavior and providing additional features.
`react-native-chunks` can be configured by creating a chunks.config.js at the root of the project.


```ts
interface ChunksConfig {
  /**
   * The output directory where the bundled chunks should be located.
   **/
  outputDir?: string

  chunks?: Array<{
    /**
     * Name of the chunk
     **/
    name: string
    /**
     * The entry point of the chunk.
     **/
    entryFile: string
    
    /**
     * Path to files that should be excluded from chunks.
     * This can be helpful when a chunk uses shared libraries that are already present in the main bundle, such as react-native.
     *
     * Example:
     * 
     * exclude: ['**/node_modules/react-native/**', '<rootDir>/src/index.js', { deps: true, pattern: '**/node_modules/react/**' }]
     **/
    exclude?: Array<string | { deps?: boolean; pattern: string }>

    /**
     * Path to files that should be included in the chunk.
     * This can be helpful when a chunk should include some modules, even if they are excluded by the exclude option.
     *
     * Example:
     * 
     * exclude: ['**/node_modules/react-native/**', '<rootDir>/src/index.js', { deps: true, pattern: '**/node_modules/react/**' }]
     **/
    include?: Array<string | { deps?: boolean; pattern: string }>

    /**
     * [Optional]
     * 
     * The output directory where the bundled chunk should be located. This overrides the root outputDir property.
     **/
    outputDir?: string
  }>

  bundle?: {
/**
     * Path to files that should be excluded from the bundle.
     *
     * Example:
     * 
     * exclude: ['**/node_modules/react-native/**', '<rootDir>/src/index.js', { deps: true, pattern: '**/node_modules/react/**' }]
     **/
    exclude?: Array<string | { deps?: boolean; pattern: string }>

    /**
     * Path to files that should be included in the bundle.
     *
     * Example:
     * 
     * exclude: ['**/node_modules/react-native/**', '<rootDir>/src/index.js', { deps: true, pattern: '**/node_modules/react/**' }]
     **/
    include?: Array<string | { deps?: boolean; pattern: string }>
  }
}
```

## Sourcemaps

`react-native-chunks` builds small chunks, resulting in several bundles and sourcemap files. To see the correct stack trace in monitoring systems like Sentry and Bugsnag, you need to compose the sourcemap file before sending it to these monitoring systems.

You can do it via `chunks-compose-sourcemaps` command. Please check [the description](#chunks-compose-sourcemaps) for more details.

## Debugging & Developer Mode

It works only for production builds, so debugging and developer mode are not affected in any way.

## Under the hood

See ["Under the hood](/docs/under-the-hood.md) section for more details.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
