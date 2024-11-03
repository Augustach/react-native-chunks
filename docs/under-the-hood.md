To understand the library, we need to consider three things:
1. How React Native loads and evaluates a script.
2. How the bundled scripts are structured.
3. How moduleId is generated.


## How React Native loads and evaluates bundles

It can be boiled down to loading the bundle file from the assets or file system using the [loadScriptFromAssets](https://github.com/facebook/react-native/blob/cc6f75bb75c0baaa9cf43f607701f5874bd7dc8d/packages/react-native/ReactAndroid/src/main/jni/react/jni/JSLoader.cpp#L66) helper.
React Native keeps the loaded data in [JSBigBufferString.cpp](https://github.com/facebook/react-native/blob/cc6f75bb75c0baaa9cf43f607701f5874bd7dc8d/packages/react-native/ReactCommon/cxxreact/JSBigString.h#L76) and then simply passes it to the [evaluateJavaScript](https://github.com/facebook/react-native/blob/cc6f75bb75c0baaa9cf43f607701f5874bd7dc8d/packages/react-native/ReactCommon/jsiexecutor/jsireact/JSIExecutor.cpp#L166) function to evaluate the script.


`evaluateJavaScript` can be described as the [eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) function. In a nutshell, loading a JS/Hermes bundle is essentially the same as evaluating a script via a string, like `eval("const func = () => { console.log("Hello world!"); }; func();")`.


## How the bundled scripts are structured

Bundle can be splitted on three parts.

1. The first part includes [polyfills](https://metrobundler.dev/docs/configuration#getpolyfills) and defining functions for [modules](https://github.com/facebook/metro/blob/5ae946db8e1278395e86796d0ada8e2e57495848/packages/metro-runtime/src/polyfills/require.js#L17), [console](https://github.com/facebook/react-native/blob/7211119d2325a67067f9dd7296cdcb9f91624c7f/packages/polyfills/console.js), [etc](https://github.com/facebook/react-native/tree/7211119d2325a67067f9dd7296cdcb9f91624c7f/packages/polyfills).

```js
// Here are the key aspects in the module definition function.
(function (global) {
  "use strict";
  const modules = new Map(); // (1) all modules are keeped in Map<moduleId, Module>
  global.__r = metroRequire;
  global[`${__METRO_GLOBAL_PREFIX__}__d`] = define;


  // (2) When we require or import a module, it is retrieved from the modules map and initialized if it has not been initialized yet.
  // Initialized means we execute the "code" of the module, which may lead to requiring other modules, etc.
  function metroRequire(moduleId) {
    const module = modules.get(moduleId)
    if (!module) {
      throw new Error()
    }

    return module?.isInitialized ? module.publicModule.exports : guardedLoadModule(moduleId, module)
    guardedLoadModule(module)
  }

  const metroImportDefault = ...
  const metroImportAll = ...

  function guardedLoadModule(module) {
    module.isInitialized = true;
    const { factory, publicModule } = module;
    // (3) factory is our code
    factory(global, metroRequire, metroImportDefault, metroImportAll, publicModule, publicModule.exports, dependencyMap);

    return publicModule.exports;
  }

  define(factory, moduleId, dependencyMap) {
    // (4) If the module has already been declared, do nothing
    if (modules.has(moduleId)) {
      return;
    }
    // (5) Declare the module and add it to the modules map.
    // The module will be initialized only when it is required by other modules.
    const module = {
      dependencyMap: dependencyMap,
      factory: factory,
      isInitialized: false,
      publicModule: {
        exports: {}
      }
    };
    modules.set(moduleId, module); 
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);

// polyfills

```

2. The second part involves module definitions.
- All modules are defined in a flat manner.
- All modules defined only once.
- Every module has a [unique ID](https://metrobundler.dev/docs/configuration#createmoduleidfactory).

```ts
__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  var Translations = _$$_REQUIRE(_dependencyMap[0], "./translations").Translations;
}, 0 /* moduleId */, [1] /* dependencyMap */, "index.ts");

__d(function (global, _$$_REQUIRE, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Translations = {
    en: _$$_REQUIRE(_dependencyMap[0], "./en.json")
  };
}, 1  /* moduleId */, [2] /* dependencyMap */, "translations.ts");
__d(function(global, require, _importDefaultUnused, _importAllUnused, module, exports, _dependencyMapUnused) {
  module.exports = {
  "message": "Hello World!",
};
}, 2  /* moduleId */, [] /* dependencyMap */, "en.json");
```

<details>
  <summary>How modules looked before bundling</summary>
  
  `src/core/index.ts` is the entry file
  ```ts
  // src/core/index.ts
  import Translations from './translations'
  ```
  is transpiled to
  ```js
    __d(function (global, _$$_REQUIRE, ..., _dependencyMap) {
      // import Translations from './translations' ->
      // _dependencyMap -> [1]
      // _dependencyMap[0] -> 1 -> 
      var Translations = _$$_REQUIRE(_dependencyMap[0], "./translations").Translations;
    }, 0 /* moduleId */, [1] /* dependencyMap */);
  ```

  the `./translations` file

  ```ts
  export const Translations = {
    en: require('./en.json'),
  }
  ```
  
  is transpiled to

  ```ts
  __d(function (global, _$$_REQUIRE, ..., module, exports, _dependencyMap) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Translations = {
      // en: require('./en.json') ->
      // _dependencyMap -> [2]
      // _dependencyMap[0] -> 2
      en: _$$_REQUIRE(_dependencyMap[0], "./en.json")
    };
  }, 1  /* moduleId */, [2] /* dependencyMap */);
  ```

  the `en.json` file
  ```json
  {
    "message": "Hello World!"
  }
  ```
  is transpiled to
  ```js
  __d(function(global, require, ..., module, exports, _dependencyMapUnused) {
    module.exports = {
      "message": "Hello World!",
    };
  }, 2  /* moduleId */, [] /* dependencyMap */);
  ```

</details>
</br>

3. The third part simply [calls the root file in the bundle](https://metrobundler.dev/docs/configuration#getrunmodulestatement).

```ts
__r(0);
```

### How moduleId is generated.

[createModuleIdFactory](https://metrobundler.dev/docs/configuration#serializer-options) is responsible for generating module ids.
[Default](https://github.com/facebook/metro/blob/d040e36eaea3879316ac39b93e0d6a1ff1d3922d/packages/metro/src/lib/createModuleIdFactory.js#L14) increments the counter for every new module path.

```ts
// origin - https://github.com/facebook/metro/blob/d040e36eaea3879316ac39b93e0d6a1ff1d3922d/packages/metro/src/lib/createModuleIdFactory.js#L14
function createModuleIdFactory(): (path: string) => number {
  const fileToIdMap: Map<string, number> = new Map();
  let nextId = 0;
  return (path: string) => {
    let id = fileToIdMap.get(path);
    if (typeof id !== 'number') {
      id = nextId++;
      fileToIdMap.set(path, id);
    }
    return id;
  };
}
```

Gathering all the concepts above, we can:

1. Keep the chunk bundle in the assets and load it via the native module, which reads the file and calls `evaluateJavaScript` of the JS engine. (see [ChunksModule](/android/src/main/java/com/ivku/chunks/ChunksModule.kt#L36))
2. Base the module `ID` on the [hash of the relative path](/src/cli/moduleId.js#L9) instead of the index. This allows for sharing modules between several bundles.
3. Split code to chunks which can load each other.
