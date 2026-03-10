const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fix: "Cannot destructure property '__extends' of 'tslib.default' as it is undefined"
// Supabase sub-packages (storage-js, functions-js, postgrest-js, realtime-js) depend on tslib.
// Metro resolves tslib's ESM entry (named exports only), but Supabase's compiled code does
// `import tslib from 'tslib'` expecting a CJS-style default export.
// Force tslib to resolve to its CJS entry on web so `tslib.default` has all helpers.
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib" && platform === "web") {
    return {
      filePath: require.resolve("tslib/tslib.js"),
      type: "sourceFile",
    };
  }

  // Fall back to default resolution
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
