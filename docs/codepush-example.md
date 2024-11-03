Thanks to `react-native-chunk`, CodePush/OTA bundles can be reduced by up to 400 KB in zip size.
You can check the [codepush-example](/codepush-example/) app as a reference, Here the key features are described.

To use `react-native-chunks` for reducing bundles, you need to:


1. Create a `chunks.config.js` file in the root of the project with empty chunks, including the `react-native` related code and the entry point file.

```js
module.exports = {
  bundle: {
    include: [
      { deps: true, pattern: '**/node_modules/react-native/**' }, // react-native files and all dependencies of react-native
      '**/node_modules/react-native-chunks/**', // react-native-chunks files
      '<rootDir>/index.js', // entry point
    ],
    exclude: ['**/*'],
  },
}
```

and add the logic to include changed files into the codepush bundle

```diff

+let changedFiles = []

+if (process.env.CODEPUSH_DIFF) {
+  changedFiles = require('./changed-deps.json') // path to the file that contains the changed files between two Git revisions..
+}

module.exports = {
  bundle: {
    include: [
      { deps: true, pattern: '**/node_modules/react-native/**' }, // react-native files and all dependencies of react-native
      '**/node_modules/react-native-chunks/**', // react-native-chunks files
      '<rootDir>/index.js', // entry point
+     ...changedFiles
    ],
    exclude: ['**/*'],
  },
}
```


2. Wrap the metro config into the `withChunksConfig` helper.

```js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const { withChunksConfig } = require('react-native-chunks/metro-config')

const config = {
  // ...
}

module.exports = withChunksConfig(
  mergeConfig(getDefaultConfig(__dirname), config)
)
```

3. [Android] add `CHUNKS_APK_BUILD_TIME` to `defaultConfig` in the `android/app/build.gradle`

```diff
android {
    defaultConfig {
        applicationId "chunks.example"
+       resValue 'string', "CHUNKS_APK_BUILD_TIME", String.format("\"%d\"", System.currentTimeMillis())
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
    }
```

4. Create a shell script to build codepush bundles

```sh
yarn react-native chunk-changed-deps --platform {platform} --entry-file {your_entry_file}  --commit {commit} > ./changed-deps.json
CODEPUSH_DIFF=true yarn code-push-diff release --app {codepush_app} --base {commit}
```
