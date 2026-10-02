const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * `@supabase/supabase-js` optionally loads `@opentelemetry/api` to forward
 * trace headers, and treats a failed import as "not installed". On web Metro
 * picks the package's ESM build, where that import is a constant string Metro
 * tries to resolve at bundle time — so the missing optional package fails the
 * whole bundle instead of being caught at runtime. Native resolves the CJS
 * build and never hits this.
 *
 * Resolving it to an empty module gives supabase-js the "not installed" answer
 * it already handles.
 */
const OPTIONAL_MODULES = new Set(['@opentelemetry/api']);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (OPTIONAL_MODULES.has(moduleName)) return { type: 'empty' };

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
