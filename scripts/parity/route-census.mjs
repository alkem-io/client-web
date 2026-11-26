import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const parse = (file, source) => ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const compact = text => text.replace(/\s+/g, ' ').trim();
const isRoute = node =>
  (ts.isJsxElement(node) && node.openingElement.tagName.getText() === 'Route') ||
  (ts.isJsxSelfClosingElement(node) && node.tagName.getText() === 'Route');

/** Read declarations, not a second hand-maintained routing table. No application modules execute. */
export function routeDeclarations(file, source) {
  const sf = parse(file, source);
  const declarations = [];
  function visit(node, ancestors = []) {
    let next = ancestors;
    if (isRoute(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const attr = name => opening.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.text === name);
      const element = attr('element')?.initializer;
      const record = {
        path: attr('path')?.initializer?.getText(sf) ?? null,
        index: attr('index')?.initializer?.getText(sf) ?? null,
        element: element ? compact(element.getText(sf)) : null,
        ancestors,
      };
      declarations.push(record);
      next = [...ancestors, declarations.length - 1];
    }
    ts.forEachChild(node, child => visit(child, next));
  }
  visit(sf);
  return declarations;
}

export const sourceHash = source => createHash('sha256').update(source).digest('hex');

export function preserveCensusAnnotations(fixture, previous) {
  if (!previous) return fixture;
  const structural = new Set([
    'id',
    'path',
    'legacyLayout',
    'dataMapper',
    'behaviour',
    'source',
    'legacyLayoutSource',
    'layoutChain',
  ]);
  const priorRows = new Map(previous.routes.map(row => [`${row.path}|${row.legacyLayout}`, row]));
  const routes = fixture.routes.map(row => {
    const oldPath = row.path.endsWith('/settings/associates') ? row.path.replace(/associates$/, 'community') : row.path;
    const prior = priorRows.get(`${row.path}|${row.legacyLayout}`) ?? priorRows.get(`${oldPath}|${row.legacyLayout}`);
    const annotations = Object.fromEntries(Object.entries(prior ?? {}).filter(([key]) => !structural.has(key)));
    return { ...row, ...annotations };
  });
  const {
    routes: _routes,
    policy: _policy,
    nativeDependencies,
    annotationSourceCommit,
    historicalEvidence,
    ...metadata
  } = previous;
  const result = { ...metadata, ...fixture, routes };
  if (historicalEvidence) result.historicalEvidence = historicalEvidence;
  if (nativeDependencies)
    result.historicalEvidence = {
      sourceCommit: annotationSourceCommit ?? previous.sourceCommit,
      baselineCommit: previous.sourceCommit,
      state: 'historical source-only annotations; current provider wiring and two-stack runtime parity remain pending',
      nativeDependencies,
      retainedProviders: previous.policy.retainedProviders ?? [],
    };
  return result;
}

export function checkRouteCensus(fixture, read, readLegacy = read) {
  const problems = [];
  for (const [file, expected] of Object.entries(fixture.policy.routeModules)) {
    if (fixture.policy.retiredComponents.includes(file)) {
      try {
        if (read(file) !== undefined) problems.push(`Retired route module still present: ${file}`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      continue;
    }
    const actual = routeDeclarations(file, read(file));
    const declared = fixture.runtimeIncrement?.routeModules?.[file] ?? expected;
    if (JSON.stringify(actual) !== JSON.stringify(declared)) problems.push(`Legacy route/layout changed: ${file}`);
  }
  for (const [file, expected] of Object.entries(fixture.policy.behaviourSources ?? {})) {
    if (sourceHash(read(file)) !== expected) problems.push(`Legacy route behaviour changed: ${file}`);
  }
  for (const row of fixture.routes) {
    if (!row.id || !row.path || !row.legacyLayout || !row.dataMapper || !row.behaviour.length) {
      problems.push(`Incomplete parity row: ${row.id}`);
    }
    for (const citation of [row.source, row.legacyLayoutSource, ...row.behaviour]) {
      let source;
      try {
        source = readLegacy(citation.file);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      if (typeof source !== 'string' || !Number.isInteger(citation.line) || citation.line < 1 || citation.line > source.split('\n').length) {
        problems.push(`Invalid legacy citation: ${row.id}: ${citation.file}:${citation.line}`);
      }
      if (citation.file.includes('/v2/')) problems.push(`V2 is not the behaviour specification: ${row.id}`);
    }
  }
  if (new Set(fixture.routes.map(row => row.id)).size !== fixture.routes.length) problems.push('Duplicate route id');
  return problems;
}

export function retiredPageFiles(root, fixture) {
  const violations = [];
  function visit(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.name === 'node_modules' || item.name.startsWith('.')) continue;
      const name = path.join(dir, item.name);
      if (item.isDirectory()) visit(name);
      else {
        const relative = path.relative(root, name).split(path.sep).join('/');
        if (
          relative.endsWith('.tsx') &&
          !/\.(test|spec)\.tsx$/.test(relative) &&
          (fixture.policy.retiredComponents.includes(relative) ||
            (relative.includes('/v2/') && new RegExp(fixture.policy.retiredComponentPattern).test(item.name)))
        ) {
          violations.push(relative);
        }
      }
    }
  }
  visit(path.join(root, 'src'));
  return violations.sort();
}
