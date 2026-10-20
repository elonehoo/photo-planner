// TypeScript 7 does not ship the compiler API. vue-tsc and typescript-eslint
// still import `typescript`, so point that specifier at @typescript/typescript6
// while `tsc` itself stays on TypeScript 7.
const Module = require('node:module')
const path = require('node:path')

const ts6Root = path.dirname(require.resolve('@typescript/typescript6/package.json'))
const originalResolveFilename = Module._resolveFilename

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'typescript' || request.startsWith('typescript/')) {
    const subpath = request === 'typescript' ? '' : request.slice('typescript/'.length)
    const mapped = subpath ? path.join(ts6Root, subpath) : ts6Root
    return originalResolveFilename.call(this, mapped, parent, isMain, options)
  }
  return originalResolveFilename.call(this, request, parent, isMain, options)
}
