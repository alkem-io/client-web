import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { checkRouteCensus, routeDeclarations } from './route-census.mjs';

export const LEGACY_COMMIT = '71f8ddcf7d0a97097a4de445c0ddc0c8a8ecb252';
const compact = text => text.replace(/\s+/g, ' ').trim();
const routeLike = source => /\bRoute\b/.test(source);
const isProtected = file =>
  file.startsWith('src/main/crdPages/') ||
  file.startsWith('src/main/routing/') ||
  file.startsWith('src/main/ui/layout/') ||
  file.startsWith('src/main/topLevelPages/') ||
  (file.startsWith('src/domain/') &&
    file
      .split('/')
      .slice(2, -1)
      .some(part => /pages?$|layouts?/i.test(part)));

function importResolver(files, read) {
  const cache = new Map();
  function info(file) {
    if (cache.has(file)) return cache.get(file);
    const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const imports = new Map();
    const locals = new Map();
    const mounted = new Set();
    const routes = [];
    for (const node of ast.statements)
      if (ts.isImportDeclaration(node) && node.importClause) {
        const module = node.moduleSpecifier.text;
        if (node.importClause.name) imports.set(node.importClause.name.text, { module, exported: 'default' });
        const bindings = node.importClause.namedBindings;
        if (bindings && ts.isNamespaceImport(bindings)) imports.set(bindings.name.text, { module, exported: '*' });
        if (bindings && ts.isNamedImports(bindings))
          for (const item of bindings.elements) {
            if ((item.propertyName?.text ?? item.name.text) === 'Route' && item.name.text !== 'Route') {
              throw new Error(`unsupported Route alias: ${file}: ${item.name.text}`);
            }
            imports.set(item.name.text, { module, exported: item.propertyName?.text ?? item.name.text });
          }
      }
    function visit(node) {
      if (ts.isVariableDeclaration(node)) {
        if (node.initializer && ts.isIdentifier(node.initializer) && node.initializer.text === 'Route') {
          throw new Error(`unsupported Route alias: ${file}: ${node.name.getText(ast)}`);
        }
        if (ts.isIdentifier(node.name)) locals.set(node.name.text, node.initializer);
        if (ts.isObjectBindingPattern(node.name))
          for (const item of node.name.elements) {
            if ((item.propertyName?.text ?? item.name.getText(ast)) === 'Route') {
              throw new Error(`unsupported Route destructuring: ${file}`);
            }
            if (ts.isIdentifier(item.name)) locals.set(item.name.text, node);
          }
      }
      if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name)
        locals.set(node.name.text, node);
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        node.tagName.getText(ast).endsWith('.Route')
      ) {
        throw new Error(`unsupported qualified Route tag: ${file}`);
      }
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(ast) === 'Route') {
        routes.push(compact(node.attributes.getText(ast)));
        mounted.add('Route');
        const element = node.attributes.properties.find(
          item => ts.isJsxAttribute(item) && item.name.text === 'element'
        );
        function tags(child) {
          if (ts.isJsxOpeningElement(child) || ts.isJsxSelfClosingElement(child)) {
            const name = child.tagName.getText(ast);
            if (/^[A-Z]/.test(name)) mounted.add(name);
          }
          ts.forEachChild(child, tags);
        }
        if (element?.initializer) tags(element.initializer);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    const result = { ast, imports, locals, mounted, routes };
    cache.set(file, result);
    return result;
  }
  function moduleFile(from, specifier) {
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null;
    const stem = specifier.startsWith('@/')
      ? `src/${specifier.slice(2)}`
      : path.posix.join(path.posix.dirname(from), specifier);
    for (const suffix of ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js']) {
      if (files.has(stem + suffix)) return stem + suffix;
    }
    throw new Error(`unresolved module ${from}: ${specifier}`);
  }
  function imported(from, binding, seen) {
    const target = moduleFile(from, binding.module);
    return target ? exported(target, binding.exported, seen) : `external:${binding.module}#${binding.exported}`;
  }
  function localExport(file, name, exposed, seen) {
    const source = info(file);
    const alias = source.imports.get(name);
    if (alias) return imported(file, alias, seen);
    const local = source.locals.get(name);
    if (local && ts.isIdentifier(local)) {
      const key = `${file}:export-alias:${name}`;
      if (seen.has(key)) throw new Error(`cyclic export alias: ${key}`);
      return localExport(file, local.text, exposed, new Set([...seen, key]));
    }
    return `${file}#${exposed}`;
  }
  function exported(file, name, seen) {
    const key = `${file}#${name}`;
    if (seen.has(key)) throw new Error(`cyclic component export: ${key}`);
    const next = new Set([...seen, key]);
    const source = info(file);
    for (const node of source.ast.statements) {
      if (ts.isExportAssignment(node) && name === 'default' && ts.isIdentifier(node.expression)) {
        return localExport(file, node.expression.text, name, next);
      }
      if (!ts.isExportDeclaration(node)) continue;
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        const item = node.exportClause.elements.find(item => item.name.text === name);
        if (!item) continue;
        const original = item.propertyName?.text ?? item.name.text;
        if (node.moduleSpecifier)
          return imported(file, { module: node.moduleSpecifier.text, exported: original }, next);
        return localExport(file, original, original, next);
      }
      if (!node.exportClause && node.moduleSpecifier) {
        const target = moduleFile(file, node.moduleSpecifier.text);
        if (target && hasExport(target, name, next)) return exported(target, name, next);
      }
    }
    if (!hasExport(file, name, seen)) throw new Error(`unresolved component export: ${key}`);
    return key;
  }
  function hasExport(file, name, seen) {
    const key = `${file}#${name}`;
    if (seen.has(key)) return false;
    const next = new Set([...seen, key]);
    return info(file).ast.statements.some(node => {
      if (ts.isExportAssignment(node) && name === 'default') return true;
      if (node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
        if (node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword) && name === 'default')
          return true;
        if (node.name?.text === name) return true;
        if (
          ts.isVariableStatement(node) &&
          node.declarationList.declarations.some(item => item.name.getText() === name)
        )
          return true;
      }
      if (!ts.isExportDeclaration(node)) return false;
      if (node.exportClause && ts.isNamedExports(node.exportClause))
        return node.exportClause.elements.some(item => item.name.text === name);
      const target = node.moduleSpecifier && moduleFile(file, node.moduleSpecifier.text);
      return target && hasExport(target, name, next);
    });
  }
  function binding(file, name, seen = new Set()) {
    const key = `${file}:${name}`;
    if (seen.has(key)) throw new Error(`cyclic component binding: ${key}`);
    const source = info(file);
    const [root, ...members] = name.split('.');
    const alias = source.imports.get(root);
    if (alias) {
      const selected = alias.exported === '*' && members.length ? members.shift() : alias.exported;
      return `${imported(file, { ...alias, exported: selected }, seen)}${members.length ? `.${members.join('.')}` : ''}`;
    }
    const local = source.locals.get(root);
    if (!local) throw new Error(`unresolved route component: ${key}`);
    if (ts.isIdentifier(local) || ts.isPropertyAccessExpression(local))
      return binding(file, local.getText(), new Set([...seen, key]));
    const targets = [];
    function imports(node) {
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const specifier = node.arguments[0];
        if (!specifier || !ts.isStringLiteral(specifier)) throw new Error(`nonliteral lazy route: ${key}`);
        let selected = 'default';
        if (ts.isPropertyAccessExpression(node.parent) && node.parent.name.text === 'then') {
          const callback = node.parent.parent.arguments?.[0];
          let body = callback?.body;
          while (body && ts.isParenthesizedExpression(body)) body = body.expression;
          const member =
            body &&
            ts.isObjectLiteralExpression(body) &&
            body.properties.find(item => ts.isPropertyAssignment(item) && item.name.getText() === 'default')
              ?.initializer;
          if (
            !member ||
            !ts.isPropertyAccessExpression(member) ||
            member.expression.getText() !== callback.parameters[0]?.name.getText()
          ) {
            throw new Error(`unresolved lazy export selector: ${key}`);
          }
          selected = member.name.text;
        }
        targets.push(imported(file, { module: specifier.text, exported: selected }, seen));
      }
      ts.forEachChild(node, imports);
    }
    imports(local);
    if (ts.isCallExpression(local) && local.arguments.length === 1 && targets.length === 1) {
      const callback = local.arguments[0];
      const loader = binding(file, local.expression.getText(), new Set([...seen, key]));
      if (
        ['external:react#lazy', 'src/core/lazyLoading/lazyWithGlobalErrorHandler.ts#lazyWithGlobalErrorHandler'].includes(
          loader
        ) &&
        ts.isArrowFunction(callback) &&
        callback.parameters.length === 0 &&
        ts.isCallExpression(callback.body) &&
        callback.body.expression.kind === ts.SyntaxKind.ImportKeyword &&
        callback.body.arguments.length === 1
      )
        return targets[0];
    }
    return `${key}:${compact(local.getText())}:${targets.sort().join('|')}`;
  }
  return file => ({
    components: new Map([...info(file).mounted].map(name => [name, binding(file, name)])),
    routes: info(file).routes,
  });
}

export function checkNoNewPages({
  baselineFiles,
  currentFiles,
  readBaseline,
  readCurrent,
  exceptions,
  routeModules = {},
  retiredModules = /** @type {string[]} */ ([]),
}) {
  const findings = [];
  for (const file of retiredModules)
    if (currentFiles.has(file)) findings.push(`Retired UI module still present: ${file}`);
  const allowed = new Set();
  for (const [directory, names] of Object.entries(exceptions))
    for (const name of names) {
      const file = `${directory}/${name}`;
      if (
        !isProtected(`${directory}/file`) ||
        /[.*?]/.test(directory) ||
        /[/*?]/.test(name) ||
        !/\.(?:ts|graphql)$|\.(?:test|spec)\.tsx$/.test(name) ||
        /(?:Page|Dialog|Panel|Container)(?:\.(?:test|spec))?\.tsx?$/.test(name)
      ) {
        findings.push(`Invalid data-file exception: ${file}`);
      } else allowed.add(file);
    }
  for (const file of [...currentFiles].sort())
    if (!baselineFiles.has(file) && isProtected(file) && !allowed.has(file)) {
      findings.push(`New protected UI file: ${file}`);
    }
  const baselineBindings = importResolver(baselineFiles, readBaseline);
  const currentBindings = importResolver(currentFiles, readCurrent);
  for (const file of [...currentFiles].sort()) {
    if (!file.endsWith('.tsx') || /\.(test|spec)\.tsx$/.test(file) || !routeLike(readCurrent(file))) continue;
    try {
      const actual = currentBindings(file);
      if (!actual.routes.length) continue;
      const expected = baselineFiles.has(file) ? baselineBindings(file) : { components: new Map(), routes: [] };
      const declaredRoutes = routeModules[file];
      if (
        !baselineFiles.has(file) ||
        (!declaredRoutes && JSON.stringify(actual.routes) !== JSON.stringify(expected.routes)) ||
        JSON.stringify(routeDeclarations(file, readCurrent(file))) !==
          JSON.stringify(declaredRoutes ?? routeDeclarations(file, readBaseline(file)))
      ) {
        findings.push(`Route declarations differ from 71f8: ${file}`);
      }
      for (const [name, origin] of actual.components)
        if (expected.components.get(name) !== origin) findings.push(`Route component rebound: ${file}: ${name}`);
    } catch (error) {
      findings.push(`Route component resolution failed: ${file}: ${error.message}`);
    }
  }
  return findings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  const baselineFiles = new Set(git(['ls-tree', '-rz', '--name-only', LEGACY_COMMIT]).split('\0').filter(Boolean));
  const currentFiles = new Set(
    git(['ls-files', '-z', '--cached', '--others', '--exclude-standard'])
      .split('\0')
      .filter(file => file && fs.existsSync(path.join(root, file)))
  );
  const readCurrent = file => fs.readFileSync(path.join(root, file), 'utf8');
  const nodeVersion = JSON.parse(readCurrent('package.json')).volta.node;
  if (process.versions.node !== nodeVersion) throw new Error(`Use pinned Node ${nodeVersion}; got ${process.version}`);
  const cache = new Map();
  const readBaseline = file => {
    if (!cache.has(file)) cache.set(file, git(['show', `${LEGACY_COMMIT}:${file}`]));
    return cache.get(file);
  };
  const fixture = JSON.parse(readCurrent('scripts/parity/fixtures/legacy-routes.71f8.json'));
  const exceptions = JSON.parse(readCurrent('scripts/parity/data-file-exceptions.json'));
  const findings = [
    ...checkRouteCensus(fixture, readCurrent, readBaseline),
    ...checkNoNewPages({
      baselineFiles,
      currentFiles,
      readBaseline,
      readCurrent,
      exceptions,
      routeModules: fixture.runtimeIncrement?.routeModules,
      retiredModules: fixture.policy.retiredComponents,
    }),
  ];
  for (const finding of findings) console.error(finding);
  const served = fixture.routes.filter(row => /\bserved\b/i.test(row.connectorState)).length;
  console.log(
    `legacy-page guard: ${findings.length ? 'FAIL' : 'PASS'}; baseline=${LEGACY_COMMIT}; routes=${fixture.routes.length}; served=${served} source-only`
  );
  process.exitCode = findings.length ? 1 : 0;
}
