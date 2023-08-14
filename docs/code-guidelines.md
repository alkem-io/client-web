# Client Code Guidelines

## Domain-Driven Design

### Directory structure and file naming

All code should be put either under `src/core` or under `src/domain`.

- `src/core` contains all components and utilities that are not directly connected to the App business domain. If a file can be potentially reused in another app with a different domain, it should be put into `core`. Examples:
  - `src/core/ui/button/FullWidthButton.tsx`
  - `src/core/ui/dialog/DialogWithGrid.tsx`
- `src/domain` contains components and utilities that are connected with the App domain. Their path and filename should denote to which part of the app domain they belong:
  - `src/domain/Challenge/Challenge/ChallengeDashboardPage.tsx`
  - `src/domain/Collaboration/Callout/CalloutView/CalloutView.tsx`

Components and utilities that are specific to the platform but aren't really part of the business domain should be put under `src/domain/platform`.
Examples:

- `src/domain/platform/routes/RedirectToLanding.tsx`

`src/domain/platform/ui` should be chosen for app-wise UI elements that aren't universal and can't be reused in another project.
Examples:

- `src/domain/platform/ui/PlatformFooter/PlatformFooter.tsx`

---

> :warning: There can be exceptions to minimize pollution of top-level folders, e.g. instead of putting component common for all Journey types directly under `domain/Challenge`, a subfolder can be created such as `domain/Challenge/common`.

> :information*source: If the file path contains a segment that is an entity **name**, such as `Challenge`, the segment should be in *CamelCase*. If the segment denotes a component/utility **type**, it should be in \_lowercase*: `ui/button`, `Challenge/pages`.

> :warning: We shouldn't try to bring deep structures just to "initially create a proper order".
> E.g.: instead of `Challenge/pages/ChallengeDashboard`, just use `Challenge/ChallengeDashboard`. If we are specific enough in domain-based structuring there shouldn't usually be too many files in any specific folder and hence no need for functional file separation.

## Component naming: inheritance + postfixes

In React, we usually implement "inheritance by composition", i.e. we wrap a base component to either:

- preprocess data
- override/decorate callbacks
- wrap the rendered result in extra markup
- provide specific children for the underlying component to render

I all cases above we modify or extend the behavior of the base component by providing some sort of customization. The name of the created component should reflect the meaning of that extension, e.g. a `Dialog` that allows to use `useColumns()` inside its children, can be named `DialogWithGrid`. If the extension suggests multiple unrelated additions to the original name, consider splitting it into several independent overrides.

## Component Roles

### Single Responsibility in React: dumb views vs smart views

A component should clearly belong to one of the following types:

1. A View (dumb component), a function that receives props and returns a formatted result. It should never request the data by utilizing hooks etc. and should not render Containers. A View is unaware of how the App logic is organized or what context it's rendered in (e.g. test or prod environment). A View's props should be one of the following:

   1.1. Data in the form of primitives, arrays and plain objects.
   1.2. Callbacks to be attached as event handlers to the rendered elements.
   1.3. Child elements (ReactElement, ReactNode) and child component implementations (ComponentType). Example: `{ listItemComponent: ComponentType<ItemProps> }` in a list component.

2. A Controller (smart component), a component that does anything except data formatting/rendering:
   2.1. Data fetching
   2.2. Managing persistence in localStorage
   2.3. Route matching

Views should not utilize React.Context much, except for some view-related utilities such as `useTranslation()` or `useColumns()`.

## React Context: when to use and when not

React Context is a convenient way to implement Singletons and Dependency Inversion in React without having to explicitly pass a dependency as a prop through parent components. Because a Context can access the parent Context, they are also irreplaceable for implicitl creation of inherited structures, such as nested grids.
On the other hand, things passed as contexts are provided implicitly and you can't statically check their presence. If you don't know or can't tell the context where a view is rendered, you can't rely on the availability of a certain React.Context.
The same Context can be mistakenly initialized multiple times (on multiple levels in the render tree) without giving any warnings, consuming extra memory and potentially requesting data multiple times.

If a Context is used to provide a Singleton, such as Space (`useSpace()`), please make sure:

1. Most of the time and for most of the components there exists such a thing as Space and only one instance of it makes sense to be present. You can unambiguously tell which instance is the current one (Space -> by its nameID in the URL).
2. Only the bare minimum of data is provided, the Context doesn't get extended to fit for the purpose of each and every view.
3. There is one level this context is initialized on (for Space, in the Space sub-router). No other initialization points are created to make the context available for a random underlying view.

If a Context is used to create a nested structure, make sure it actually represents a global concept/notion, e.g. Grid Context implements nested grids that are part of Alkemio UX/UI guidelines.

## React Utilities such as useMemo (useCallback)

React provides several optimization techniques that help reduce the number of computations and re-renders, including hooks named `useMemo()` and `useCallback()`.
It's worth to keep in mind a few hints on when to use them and when not.

### useMemo

Usages:

1. You want to avoid running a heavy function on each render, so you wrap the function into `useMemo` to call it only when the parameters change.
   > Usage criteria: the function is likely to cause performance problems.
2. You do data mapping inside your component and you want to avoid creation of new objects or arrays on each render, so that the child components receive objects with the same identity.

   > Usage criteria:
   > your function produces new objects;
   > those objects are passed to child components as props.
   > also: see useCallback

3. If you create a component (`ComponentType`) to pass as a prop, always wrap into `useMemo()` to preserve the component identity. If the component identity changes, React will always remount (that basically disables incremental rendering for the component).

```js
// Wrong
const MyComponent = ({ prop }) => {
  const Component = () => <Input color="prop" />;

  return <MyForm inputComponent={Component} />;
};

// Correct
const MyComponent = ({ prop }) => {
  const Component = useMemo(() => () => <Input color="prop" />, [prop]);

  return <MyForm inputComponent={Component} />;
};
```

### useCallback

useCallback is actually a shortcut based on `useMemo()`. It's created for one particular reason: functions defined in your component body are always new instances, recreated on each render. If you pass them as props, the child components props always change. However if you wrap those functions in `useCallback`, the functions won't be redeclared unless their dependencies change.

> :warning: **When not to use:**
> Don't use `useCallback` for the functions that are used in the same component. Unless you pass those functions as props, there's no use in `useCallback`. It doesn't optimize anything about how the function executes.

## Component prop types/interfaces

### Structure/nesting

We should avoid putting nested objects into props with the exception of view models, such as `props.callout` for a `CalloutView`.
To simplify passing data into views, view models can have a similar structure to GraphQL models, but they should not be based on GraphQL definitions directly.
It is important that only the values that are really consumed by a view are specified in its props.

> :warning: Don't base View component props on GraphQL definitions. A _View_ should not have imports from `src/core/apollo`.
> On the other hand, return types of _Containers/Hooks_ can (but not necessarily should) be based on GraphQL types.

### View models

As view models are often unique to the view (different views render different properties), there's often no use
in _shared_ view models. To minimize code repetition you can export you view props and then refer to them in a parent view:

```ts
interface CalloutsListViewProps {
  callouts: CalloutCardViewProps['callout'][];
  //...
}
```

In this case `CalloutCardViewProps['callout']` becomes a view model that can be reused while keeping the reference to the view
it's used in.

If the number of props is too high for them to remain ungrouped, please group by domain, not per functional rote.
In this case it's both easier to directly pass hook exports as well as proxy those props to the child views.

```ts
// Wrong:
interface PropsByRole {
  entities: {
    callouts: Callout[];
    leadUsers: User[];
  };
  callbacks: {
    updateCallout: () => void;
    refetchLeads: () => void;
  };
}

// Correct:
interface PropsByDomain {
  callouts: {
    callouts: Callout[];
    updateCallout: () => void;
  };
  community: {
    leadUsers: User[];
    refetchLeads: () => void;
  };
}
```

## Containers vs hooks

Hooks were created to replace `Container` components or `High-Order Components (HOCs)` for several reasons:

- they don't increase the tree size
- they don't impose nesting

However, hooks have one limitation: they can't be called conditionally or appear in loops because React identifies hooks by the call order. For cases such
as looping over list items and wrapping them into data fetching logic, we have to fall back to Containers or HOCs.

## All-inclusive providers vs per-function providers

Whenever you want to join together some data-fetching and data-manipulation functions, please make sure they belong to the same domain, e.g. `Callouts`. Don't combine multiple domains in one hook. The only exception is creating a `Container` component for a `Page`. Ideally, a `Container` consists of multiple per-domain hooks and/or some small queries too simple to abstract into their own hook.

## Top-level components: Pages, Containers, Views, Layouts. Typical page structure, remounting.

Typically layout/view nesting is done by rendering the common UI parts inside more generic routes (such as `/identity` vs `/:hub`) and putting smaller/nested UI parts into more specific, nested routes such as `/admin/hubs` or `/:hub/dashboard`. However, with this approach you get the following disadvantages:

1. It's impossible to tell by looking at a specific page view (such as Hub Dashboard), what layout it's rendered in.
2. It's hard to control/customize the outer, layout parts of the UI from the specific page view (example: breadcrumbs). You have to rely on `useEffect` and `React.Context`.

Instead of doing that, we render most of the app UI from page components. A typical route/page pair looks like that:

```jsx
const Page = () => {
  return (
    <Layout>
      <Container>
        <View />
      </Container>
    </Layout>
  );
};

<Route path="/page" element={<Page />} />;
```

One obvious downside of it should be that the whole Layout gets remounted when the Page changes even if the next Page renders the same type of Layout. However, we work around that limitation by "throwing" layout to the top of the tree, where it's rendered by the Layout Holder. For that technique to work, the following must be observed:

1. There should be a `LayoutHolder` component rendered somewhere high in the tree, ideally above all routes. Please see `createLayoutHolder` in `src/core/ui/layout/LayoutHolder/LayoutHolder.tsx`
2. The Layout rendered from a Page should be wrapped in a HOC `createLayout` (returned by `createLayoutHolder`).
3. All Page components should return some type of Layout produced by `createLayout`.

That ensures that as long as the type of the returned Layout stays the same, only its props get updated.

> :information_source: For use within an index Route, use `createLayoutHolderWithOutlet` helper, which adapts `createLayoutHolder` to `react-router`.

> :warning: One important side effect of the described architecture is that the hooks placed in the Page component body would not inherit this special behavior of Layout. They will keep the normal behavior of React hooks and will be reinstantiated on each route/page change. For efficient data loading it's key to keep all Apollo-related hooks in a `Container` and not place them directly into the `Page.`

## Component Library and Avoidance of code repetition

Any component that represents a self-sufficient UI building block and/or contains CSS tweaks, should be considered a UI Library Component and put into `src/core/ui`.
Domain-specific components should normally not include low-level markup (such as rendering `<div>` or `<Box>`) or CSS with the exception of one-time customization/an exclusive override for a specific page.
