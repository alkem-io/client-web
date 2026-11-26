import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

export function enumDeclarations(source, enumName) {
  const ast = ts.createSourceFile('declaration.ts', source, ts.ScriptTarget.Latest, true);
  const declaration = ast.statements.find(node => ts.isEnumDeclaration(node) && node.name.text === enumName);
  if (!declaration) throw new Error(`Missing legacy enum declaration: ${enumName}`);
  return declaration.members.map(member => {
    if (!member.initializer || !ts.isStringLiteral(member.initializer)) {
      throw new Error(`Non-literal legacy enum member: ${enumName}.${member.name.getText(ast)}`);
    }
    return [member.name.getText(ast), member.initializer.text];
  });
}

// Fable cye8zoe6wdp9: these two legacy enum identifiers are audience
// pseudo-roles, never credentials. They are excluded, not renamed or granted.
const DECLARED_AUDIENCE_EXCLUSIONS = new Map([['Anonymous', 'anonymous'], ['Guest', 'guest']]);

/** Names only. No authority is created by this projection. Every join is literal. */
export function generateVocabulary({ clientDeclarations, roleDeclarations, entitlementDeclarations, vocabulary }) {
  const roles = new Set(vocabulary.roles);
  const entitlements = new Set(vocabulary.entitlements);
  const originalRoles = new Map(enumDeclarations(roleDeclarations, 'RoleName'));
  const originalEntitlements = new Map(enumDeclarations(entitlementDeclarations, 'LicenseEntitlementType'));
  const legacyRoles = new Map();
  for (const row of vocabulary.legacy_credential_types ?? []) {
    if (legacyRoles.has(row.source_role)) throw new Error(`Duplicate legacy credential type: ${row.source_role}`);
    if (!roles.has(row.target_role)) throw new Error(`Undeclared role target: ${row.target_role}`);
    legacyRoles.set(row.source_role, row.target_role);
  }
  const unmatched = [];
  function project(enumName, source, resolve) {
    return enumDeclarations(clientDeclarations, enumName).flatMap(([identifier, wireValue]) => {
      // The old GraphQL wire value is exactly the server enum identifier.
      // Neither prefixes, casing nor separators are changed or guessed here.
      const original = source.get(wireValue);
      if (enumName === 'RoleName' && DECLARED_AUDIENCE_EXCLUSIONS.get(identifier) === original && original !== undefined) return [];
      const target = original === undefined ? undefined : resolve(original);
      if (target === undefined) {
        unmatched.push(`${enumName}.${identifier} (${wireValue} -> ${original ?? 'missing declaration'})`);
        return [];
      }
      return [[identifier, target]];
    });
  }
  const roleNames = project('RoleName', originalRoles, name => legacyRoles.get(name) ?? (roles.has(name) ? name : undefined));
  const entitlementNames = project('LicenseEntitlementType', originalEntitlements, name => entitlements.has(name) ? name : undefined);
  if (unmatched.length) throw new Error(`Unmatched legacy identifiers; no output written:\n${unmatched.join('\n')}`);
  const render = (name, members) => `export enum ${name} {\n${members.map(([identifier, value]) => `  ${identifier} = ${JSON.stringify(value)},`).join('\n')}\n}\n`;
  return `// Generated from pinned server vocabulary and original legacy declarations. DO NOT EDIT.\n// KERNEL-BOUND: identifier names only; this file never grants authority.\n${render('RoleName', roleNames)}\n${render('LicenseEntitlementType', entitlementNames)}`;
}

export function rewriteLegacyModule(source, targetModule) {
  const ast = ts.createSourceFile('graphql-schema.ts', source, ts.ScriptTarget.Latest, true);
  const names = ['RoleName', 'LicenseEntitlementType'];
  const declarations = ast.statements.filter(node => ts.isEnumDeclaration(node) && names.includes(node.name.text));
  const imports = `import type { LicenseEntitlementType, RoleName } from '${targetModule}';\n\nexport { LicenseEntitlementType, RoleName } from '${targetModule}';\n`;
  const hasImport = ast.statements.find(node => ts.isImportDeclaration(node) && node.moduleSpecifier.text === targetModule && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings) && names.every(name => node.importClause.namedBindings.elements.some(element => element.name.text === name)));
  const hasExport = ast.statements.find(node => ts.isExportDeclaration(node) && node.moduleSpecifier?.text === targetModule && node.exportClause && ts.isNamedExports(node.exportClause) && names.every(name => node.exportClause.elements.some(element => element.name.text === name)));
  if (!declarations.length && hasImport && hasExport) declarations.push(hasImport, hasExport);
  if (declarations.length !== 2) throw new Error('Legacy vocabulary module is neither original nor generated');
  let rewritten = source;
  for (const node of declarations.sort((a, b) => b.getStart(ast) - a.getStart(ast))) {
    rewritten = rewritten.slice(0, node.getStart(ast)) + rewritten.slice(node.end);
  }
  return imports + rewritten.trimStart();
}

export function run(manifestPath) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const read = key => {
    const { path, sha256 } = manifest[key];
    const source = fs.readFileSync(path, 'utf8');
    if (createHash('sha256').update(source).digest('hex') !== sha256) throw new Error(`Input hash mismatch: ${key}`);
    return source;
  };
  const output = generateVocabulary({
    clientDeclarations: read('clientDeclarations'),
    roleDeclarations: read('roleDeclarations'),
    entitlementDeclarations: read('entitlementDeclarations'),
    vocabulary: JSON.parse(read('vocabulary')),
  });
  const legacyModule = manifest.legacyModule;
  const rewritten = legacyModule ? rewriteLegacyModule(fs.readFileSync(legacyModule.path, 'utf8'), legacyModule.targetModule) : undefined;
  fs.writeFileSync(manifest.output, output);
  if (rewritten !== undefined) fs.writeFileSync(legacyModule.path, rewritten);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (!process.argv[2]) throw new Error('Usage: node scripts/native/generate-vocabulary.mjs <input-manifest.json>');
    run(process.argv[2]);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
