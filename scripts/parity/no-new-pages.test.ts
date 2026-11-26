// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { checkNoNewPages } from './no-new-pages.mjs';
import { routeDeclarations } from './route-census.mjs';

const route = 'src/main/routing/Routes.tsx';
const page = 'src/main/crdPages/home/Home.tsx';
const source = `import {Route} from 'react-router-dom';
import Page from '../crdPages/home/Home';
export const Routes = () => <Route path="/" element={<Page/>}/>;`;
const baseline = { [route]: source, [page]: 'export default function Home(){return null;}' };
const check = (current: Record<string, string>, exceptions = {}, before = baseline, routeModules = {}, retiredModules: string[] = []) =>
  checkNoNewPages({
    baselineFiles: new Set(Object.keys(before)),
    currentFiles: new Set(Object.keys(current)),
    readBaseline: (file: string) => before[file],
    readCurrent: (file: string) => current[file],
    exceptions,
    routeModules,
    retiredModules,
  });

describe('one legacy-page source guard', () => {
  it('accepts the unchanged route and its actual component binding', () => {
    expect(check(baseline)).toEqual([]);
  });

  it('rejects restoring an explicitly retired module even when it existed in the legacy tree', () => {
    expect(check(baseline, {}, baseline, {}, [page])).toContain(`Retired UI module still present: ${page}`);
  });

  it('accepts an explicit runtime route cut while still rejecting import rebinding and extra routes', () => {
    const cut = source.replace('path="/"', 'path="/spaces"');
    const declared = { [route]: routeDeclarations(route, cut) };
    expect(check({ ...baseline, [route]: cut }, {}, baseline, declared)).toEqual([]);
    expect(check({ ...baseline, [route]: source }, {}, baseline, declared)).toContain(
      `Route declarations differ from 71f8: ${route}`
    );
    const replaced = cut.replace('../crdPages/home/Home', './mapper');
    expect(
      check(
        { ...baseline, [route]: replaced, 'src/main/routing/mapper.ts': 'export default () => null;' },
        { 'src/main/routing': ['mapper.ts'] },
        baseline,
        declared
      )
    ).toContain(`Route component rebound: ${route}: Page`);
  });

  it.each([
    'src/main/crdPages/notes/New.tsx',
    'src/main/routing/new.json',
    'src/main/ui/layout/nested/New.tsx',
    'src/main/topLevelPages/New.tsx',
    'src/domain/space/layout/nested/New.tsx',
    'src/domain/community/actor/ActorProfilePage/New.tsx',
  ])('rejects an added protected file outside /v2/: %s', file => {
    expect(check({ ...baseline, [file]: 'export const New = () => null;' })).toContain(
      `New protected UI file: ${file}`
    );
  });

  it('allows an explicitly declared native mapper but neither arbitrary /v2/ files nor hooks', () => {
    const dir = 'src/main/routing/urlResolver/native';
    const mapper = `${dir}/nativeRouteDataMapper.ts`;
    const exceptions = { [dir]: ['nativeRouteDataMapper.ts'] };
    expect(check({ ...baseline, [mapper]: 'export const map = input => input;' }, exceptions)).toEqual([]);
    for (const name of ['NewPage.tsx', 'useAnything.ts']) {
      expect(check({ ...baseline, [`${dir}/${name}`]: 'export const New = () => null;' }, exceptions)).toContain(
        `New protected UI file: ${dir}/${name}`
      );
    }
  });

  it('rejects import rebinding with identical JSX, even to an allowed data file', () => {
    const added = 'src/main/routing/urlResolver/native/nativeRouteDataMapper.ts';
    const current = {
      ...baseline,
      [added]: 'export default () => null;',
      [route]: source.replace('../crdPages/home/Home', './urlResolver/native/nativeRouteDataMapper'),
    };
    expect(check(current, { 'src/main/routing/urlResolver/native': ['nativeRouteDataMapper.ts'] })).toContain(
      `Route component rebound: ${route}: Page`
    );
  });

  it('rejects adding the Router Component prop while retaining the existing element', () => {
    expect(check({ ...baseline, [route]: source.replace('element=', 'Component={NewPage} element=') })).toContain(
      `Route declarations differ from 71f8: ${route}`
    );
  });

  it.each([
    `import {Route as R} from 'react-router-dom'; export const Routes=()=> <R Component={NewPage}/>;`,
    `import * as Router from 'react-router-dom'; export const Routes=()=> <Router.Route Component={NewPage}/>;`,
    `import {Route} from 'react-router-dom'; const R=Route; export const Routes=()=> <R Component={NewPage}/>;`,
  ])('fails closed on a new aliased Router form outside the protected folders', added => {
    const file = 'src/outside/NewRoutes.tsx';
    expect(
      check({ ...baseline, [file]: added }).some(finding =>
        finding.startsWith(`Route component resolution failed: ${file}: unsupported`)
      )
    ).toBe(true);
  });

  it('refuses the destructured Route alias outside protected folders', () => {
    const file = 'src/outside/Added.tsx';
    const added = `import * as Router from 'react-router-dom'; const {Route: R}=Router; export const Added=()=> <R Component={NewPage}/>;`;
    expect(check({ ...baseline, [file]: added })).toContain(
      `Route component resolution failed: ${file}: unsupported Route destructuring: ${file}`
    );
  });

  it('refuses UI or wildcard exceptions rather than letting the allowlist disable the guard', () => {
    const dir = 'src/main/crdPages/home';
    for (const name of ['NewPage.tsx', '*.ts']) {
      expect(check(baseline, { [dir]: [name] })).toContain(`Invalid data-file exception: ${dir}/${name}`);
    }
  });

  it('rejects a different named export while retaining both path and JSX identifier', () => {
    const original = source.replace(
      "import Page from '../crdPages/home/Home'",
      "import {Home as Page} from '../crdPages/home/Home'"
    );
    const before = {
      ...baseline,
      [route]: original,
      [page]: 'export const Home=()=>null; export const Other=()=>null;',
    };
    expect(check({ ...before, [route]: original.replace('Home as Page', 'Other as Page') }, {}, before)).toContain(
      `Route component rebound: ${route}: Page`
    );
  });

  it('follows a barrel and its local export alias instead of trusting its old filename', () => {
    const barrel = 'src/shared/page.ts';
    const before = {
      ...baseline,
      [route]: source.replace('../crdPages/home/Home', '@/shared/page'),
      [barrel]: `export {default} from '../main/crdPages/home/Home';`,
    };
    const current = {
      ...before,
      'src/outside/New.tsx': 'export default()=>null;',
      [barrel]: `import Replacement from '../outside/New'; const Alias=Replacement; export default Alias;`,
    };
    expect(check(current, {}, before)).toContain(`Route component rebound: ${route}: Page`);
  });

  it('follows wildcard re-exports when the import itself stays unchanged', () => {
    const barrel = 'src/shared/page.ts';
    const before = {
      ...baseline,
      [page]: 'export const Home=()=>null;',
      [route]: source.replace("import Page from '../crdPages/home/Home'", "import {Home as Page} from '@/shared/page'"),
      [barrel]: `export * from '../main/crdPages/home/Home';`,
    };
    expect(
      check(
        {
          ...before,
          'src/outside/New.tsx': 'export const Home=()=>null;',
          [barrel]: `export * from '../outside/New';`,
        },
        {},
        before
      )
    ).toContain(`Route component rebound: ${route}: Page`);
  });

  it('resolves lazy loaders and aliases without treating unchanged JSX as sufficient', () => {
    const lazy = source.replace(
      "import Page from '../crdPages/home/Home';",
      "import {lazy} from 'react'; const Loaded=lazy(()=>import('../crdPages/home/Home')); const Page=Loaded;"
    );
    const before = { ...baseline, [route]: lazy };
    expect(check(before, {}, before)).toEqual([]);
    expect(
      check(
        {
          ...before,
          'src/outside/New.tsx': 'export default()=>null;',
          [route]: lazy.replace("import('../crdPages/home/Home')", "import('@/outside/New')"),
        },
        {},
        before
      )
    ).toContain(`Route component rebound: ${route}: Page`);
  });

  it('accepts eager loading of the same pure lazy page, retaining rebinding and wrapper refusals', () => {
    const lazy = source.replace(
      "import Page from '../crdPages/home/Home';",
      "import {lazy} from 'react'; const Page=lazy(()=>import('../crdPages/home/Home'));"
    );
    const before = { ...baseline, [route]: lazy };
    expect(check(baseline, {}, before)).toEqual([]);
    expect(
      check({ ...baseline, [page]: `${baseline[page]} export const Other=()=>null;`,
        [route]: source.replace('import Page from', 'import {Other as Page} from') }, {}, before)
    ).toContain(`Route component rebound: ${route}: Page`);
    expect(
      check({ ...baseline, [route]: source.replace('../crdPages/home/Home', './Other'),
        'src/main/routing/Other.tsx': 'export default()=>null;' }, {}, before)
    ).toContain(`Route component rebound: ${route}: Page`);
    for (const altered of [
      lazy.replace("import {lazy} from 'react';", "import {lazy as reactLazy} from 'react'; const lazy=loader=>reactLazy(loader);"),
      lazy.replace("import('../crdPages/home/Home'))", "import('../crdPages/home/Home'), hoc)"),
      lazy.replace("()=>import('../crdPages/home/Home')", "()=>{observe();return import('../crdPages/home/Home')}"),
    ]) {
      expect(check({ ...before, [route]: altered }, {}, before)).toContain(`Route component rebound: ${route}: Page`);
    }
  });

  it('resolves the existing named lazy-export selector and rejects its rebinding', () => {
    const lazy = source.replace(
      "import Page from '../crdPages/home/Home';",
      "import {lazy} from 'react'; const Page=lazy(()=>import('../crdPages/home/Home').then(m=>({default:m.Home})));"
    );
    const before = { ...baseline, [route]: lazy, [page]: 'export const Home=()=>null; export const Other=()=>null;' };
    expect(check(before, {}, before)).toEqual([]);
    expect(check({ ...before, [route]: lazy.replace('default:m.Home', 'default:m.Other') }, {}, before)).toContain(
      `Route component rebound: ${route}: Page`
    );
  });
});
