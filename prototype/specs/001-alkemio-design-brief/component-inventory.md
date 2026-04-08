# Alkemio Client-Web: Component Inventory & MUI → shadcn/ui Mapping

> **Source**: `alkem-io/client-web` (GitHub, main branch)  
> **UI Framework**: MUI v5+ with extensive custom theming  
> **Form Library**: Formik + Yup  
> **Styling**: MUI `createTheme` with custom palette, typography, and component overrides  
> **Spacing Unit**: `10px` (GUTTER_PX = 10, `gutters(n)` = n × 10px)

---

## 1. DESIGN TOKENS & THEME

### Color Palette (`src/core/ui/palette/palette.ts`)

| Token | Value | Usage |
|-------|-------|-------|
| `primary.main` | `#1D384A` | Buttons, links, accents |
| `secondary.main` | `#2f3434` | Secondary elements |
| `background.default` | `#F1F4F5` | Page background |
| `background.paper` | `#FFFFFF` | Cards, surfaces |
| `text.primary` | `#181828` | Body text |
| `divider` | `#D3D3D3` | Borders, separators |
| `positive.main` | `#00D4B4` | Success states |
| `negative.main` | `#D32F2F` | Error/destructive states |
| `neutral.main` | `#181828` | Neutral state |
| `muted.main` | `#A8A8A8` | Muted/disabled text |
| `neutralMedium.main` | (grey) | Medium borders |
| `neutralLight` | `#F9F9F9` | Light background variant |
| `highlight.main` | `#CDE7ED` | Focus/highlight |
| `highlight.dark` | `#1D384A` | Focus/highlight dark |

### Typography (`src/core/ui/typography/themeTypographyOptions.ts`)

| Variant | Size | Weight | Font |
|---------|------|--------|------|
| `h1` | 25px | Bold | Montserrat |
| `h2` | 18px | Bold | Montserrat |
| `h3` | 15px | Regular | Montserrat |
| `h4` | 12px | Regular | Montserrat |
| `h5` | 14px | Bold | Source Sans Pro |
| `h6` | 14px | Regular | Source Sans Pro |
| `subtitle1` | 16px | Italic | Montserrat |
| `body1` | 14px | Regular | Source Sans Pro |
| `body2` | 12px | Regular | Source Sans Pro |
| `button` | 12px | Medium, Uppercase | Montserrat |
| `caption` | 12px | Regular | Montserrat |

### Spacing & Shape (`src/core/ui/themes/default/Theme.ts`)

| Token | Value |
|-------|-------|
| `spacing` | `10` (base unit = 10px) |
| `shape.borderRadius` | `12` |
| `shape.borderRadiusSquare` | `6` |
| `breakpoints.md` | `1100` |
| `avatarSizeXs` | `40` |
| `avatarSize` | `70` |
| `avatarSizeLg` | `90` |

---

## 2. LAYOUT COMPONENTS

### Page Structure

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **TopLevelLayout** | `src/main/ui/layout/TopLevelLayout.tsx` | Root app shell: nav bar + header + content + footer + floating actions | Custom layout wrapper |
| **TopLevelPageLayout** | `src/main/ui/layout/topLevelPageLayout/TopLevelPageLayout.tsx` | Page with banner + PageContent, extends TopLevelLayout | Custom layout wrapper |
| **HomePageLayout** | `src/main/topLevelPages/Home/HomePageLayout.tsx` | Home page specific layout with nav + banner | Custom layout wrapper |
| **PageContent** | `src/core/ui/content/PageContent.tsx` | Top-level `<main>` content wrapper, sets up grid context | Custom container (no direct equivalent) |
| **PageContentColumn** | `src/core/ui/content/PageContentColumn.tsx` | Column within page, controls width via grid columns | CSS Grid / Flexbox column |
| **PageContentColumnBase** | `src/core/ui/content/PageContentColumnBase.tsx` | Base grid container for content blocks | CSS Grid container |
| **PageContentBlock** | `src/core/ui/content/PageContentBlock.tsx` | Primary content block with outlined Paper border (borderRadius: 12) | `Card` (shadcn) |
| **PageContentBlockSeamless** | `src/core/ui/content/PageContentBlockSeamless.tsx` | Content block without Paper/border | Plain `div` wrapper |
| **BasePageContentBlock** | `src/core/ui/content/BasePageContentBlock.tsx` | Generic base for all content blocks, supports disablePadding/Gap/halfWidth/fullHeight/columns | Base component |
| **PageContentBlockGrid** | `src/core/ui/content/PageContentBlockGrid.tsx` | Grid within a content block (card layouts) | CSS Grid |
| **PageContentBlockCollapsible** | `src/core/ui/content/PageContentBlockCollapsible.tsx` | Collapsible content block with expand/collapse animation | `Collapsible` (shadcn) |
| **PageContentBlockHeader** | `src/core/ui/content/PageContentBlockHeader.tsx` | Header for blocks: title, icon, actions, disclaimer | `CardHeader` (shadcn) |
| **PageContentBlockHeaderCardLike** | `src/core/ui/content/PageContentBlockHeaderCardLike.tsx` | Card-like header: avatar, subtitle, selected state | Custom `CardHeader` variant |
| **PageContentBlockHeaderWithDialogAction** | `src/core/ui/content/PageContentBlockHeaderWithDialogAction.tsx` | Block header with expand-to-dialog button | Custom header + `Dialog` trigger |
| **PageContentBlockFooter** | `src/core/ui/content/PageContentBlockFooter.tsx` | Simple flex footer (space-between) | `CardFooter` (shadcn) |
| **PageContentBlockBanner** | `src/core/ui/content/PageContentBlockBanner.tsx` | Banner with image background + overlay | Custom banner |
| **PageContentBlockContextualMenu** | `src/core/ui/content/PageContentBlockContextualMenu.tsx` | Three-dot context menu (MoreVert + Menu) | `DropdownMenu` (shadcn) |
| **PageContentRibbon** | `src/core/ui/content/PageContentRibbon.tsx` | Colored ribbon bar (primary bg, paper text) | Custom `Badge` / ribbon |
| **DashboardBanner** | `src/core/ui/content/DashboardBanner.tsx` | Dashboard banner with RouterLink + close | `Alert` / custom banner |
| **PageBanner** | `src/core/ui/layout/pageBanner/PageBanner.tsx` | Full-width page banner with card overlay | Custom hero banner |
| **PageBannerCardWrapper** | `src/core/ui/layout/pageBannerCard/PageBannerCardWrapper.tsx` | Glassmorphic card overlay (backdrop-filter blur, alpha bg) | Custom glass card |

### Grid System

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **Gutters** | `src/core/ui/grid/Gutters.tsx` | Universal spacing wrapper (padding + gap via gutters). **Most used layout primitive.** Props: `row`, `disablePadding`, `disableGap`, `fullHeight` | `cn()` utility + Tailwind classes |
| **GuttersGrid** | `src/core/ui/grid/GuttersGrid.tsx` | Grid variant of Gutters | Tailwind grid |
| **GridProvider** | `src/core/ui/grid/GridProvider.tsx` | Context provider for grid column count | CSS custom properties / context |
| **GridContainer** | `src/core/ui/grid/GridContainer.tsx` | Container with gutter-based gap | Tailwind container |
| **GridItem** | `src/core/ui/grid/GridItem.tsx` | Grid item with column-based width calculation | Tailwind grid spans |
| **`gutters(n)`** | `src/core/ui/grid/utils.ts` | Spacing utility function (n × base spacing) | Tailwind spacing scale |
| **`useScreenSize()`** | `src/core/ui/grid/constants.ts` | Responsive breakpoint hook | Tailwind responsive classes |
| **`useGlobalGridColumns()`** | `src/core/ui/grid/constants.ts` | Gets global column count based on screen | Media queries |

### Utilities

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **Centered** | `src/core/ui/utils/Centered.tsx` | Centered flex container | `flex items-center justify-center` |
| **Overlay** | `src/core/ui/utils/Overlay.tsx` | Overlay utility | Custom overlay |
| **SwapColors** | `src/core/ui/palette/SwapColors.tsx` | Theme color inversion (primary ↔ background for accent blocks) | Dark mode / theme toggle variant |
| **ElevationContext** | `src/core/ui/utils/ElevationContext.tsx` | Paper elevation context provider | Shadow utilities |
| **FlexSpacer** | `src/core/ui/utils/FlexSpacer.tsx` | Flex spacer | `flex-grow` |

---

## 3. NAVIGATION COMPONENTS

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **NavigationBar** | `src/core/ui/navigation/NavigationBar.tsx` | Sticky/fixed nav bar with scroll behavior (slide in/out), backdrop blur | `NavigationMenu` (shadcn) / custom sticky nav |
| **PlatformNavigationBar** | `src/main/ui/platformNavigation/PlatformNavigationBar.tsx` | Main app navigation bar with breadcrumbs, search, user actions | Custom nav bar |
| **Breadcrumbs** | `src/core/ui/navigation/Breadcrumbs.tsx` | Breadcrumb container with expand/collapse, separator (DoubleArrow) | `Breadcrumb` (shadcn) |
| **BreadcrumbsItem** | `src/core/ui/navigation/BreadcrumbsItem.tsx` | Individual breadcrumb: avatar/icon, expandable label, Paper chip style | `BreadcrumbItem` (shadcn) |
| **BreadcrumbsRootItem** | `src/main/ui/breadcrumbs/BreadcrumbsRootItem.tsx` | Root breadcrumb with logo | First `BreadcrumbItem` |
| **TopLevelPageBreadcrumbs** | `src/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs.tsx` | Breadcrumbs wrapper for top-level pages | `Breadcrumb` container |
| **SpaceBreadcrumbs** | `src/domain/space/components/spaceBreadcrumbs/SpaceBreadcrumbs.tsx` | Space-specific breadcrumbs with hierarchy | Custom `Breadcrumb` |
| **NavigationBarSideContent** | `src/core/ui/navigation/NavigationBarSideContent.tsx` | Absolute-positioned side content in nav bar | Custom positioning |
| **NavigationItemContainer** | `src/core/ui/navigation/NavigationItemContainer.tsx` | Paper-based navigation item wrapper | Custom nav item |
| **HeaderNavigationTab** | `src/domain/shared/components/PageHeader/HeaderNavigationTab.tsx` | Tab-based navigation (MUI Tab + RouterLink) | `Tabs` (shadcn) |
| **HeaderNavigationTabs** | `src/domain/shared/components/PageHeader/HeaderNavigationTabs.tsx` | Container for navigation tabs | `TabsList` (shadcn) |
| **DashboardNavigation** | `src/domain/space/components/spaceDashboardNavigation/dashboardNavigation/DashboardNavigation.tsx` | Space dashboard sidebar nav with collapsible tree | `Sidebar` + `Collapsible` (shadcn) |
| **RouterLink** | `src/core/ui/link/RouterLink.tsx` | React Router link component | Next.js `Link` / standard `<a>` |
| **ConditionalLink** | `src/core/ui/link/ConditionalLink.tsx` | Link that renders as span if no URL | Conditional wrapper |
| **SkipLink** | `src/core/ui/keyboardNavigation/SkipLink.tsx` | Accessibility skip navigation link | Custom a11y skip link |
| **LogoComponent** | `src/main/ui/layout/topBar/LogoComponent.tsx` | Logo with RouterLink to home | Logo component |

---

## 4. DATA DISPLAY COMPONENTS

### Typography

| Component | Location | MUI Variant | Purpose | shadcn/ui Equivalent |
|-----------|----------|-------------|---------|---------------------|
| **PageTitle** | `src/core/ui/typography/components.tsx` | `h1` | Page-level heading | `<h1>` with Tailwind |
| **BlockTitle** | `src/core/ui/typography/components.tsx` | `h2`, bold | Section/block heading | `<h2>` with Tailwind |
| **BlockSectionTitle** | `src/core/ui/typography/components.tsx` | `h3` | Sub-section heading | `<h3>` with Tailwind |
| **Tagline** | `src/core/ui/typography/components.tsx` | `subtitle1` | Italic tagline text | `<p>` italic |
| **Text** | `src/core/ui/typography/components.tsx` | `body1` | Body text | `<p>` with Tailwind |
| **CardTitle** | `src/core/ui/typography/components.tsx` | Bold variant | Card heading | Card title |
| **CardText** | `src/core/ui/typography/components.tsx` | `body2`, lightened | Card body text | Card description |
| **RibbonText** | `src/core/ui/typography/components.tsx` | `body2`, centered, uppercase | Ribbon/badge text | Badge text |
| **Caption** | `src/core/ui/typography/components.tsx` | `caption`, block | Caption text | `<small>` / muted text |
| **CaptionSmall** | `src/core/ui/typography/components.tsx` | `caption`, italic | Small caption | `<small>` italic |
| **TextBlock** | `src/core/ui/typography/TextBlock.tsx` | – | Flex column with half-gutter gap | Stacked text container |
| **BlockTitleWithIcon** | `src/core/ui/content/BlockTitleWithIcon.tsx` | – | Title with leading icon | Custom heading |

### Avatar & Icons

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **Avatar** | `src/core/ui/avatar/Avatar.tsx` | Custom Avatar extending MUI with sizes (xs=40, default=70, lg=90) + overlay | `Avatar` (shadcn) |
| **Icon** | `src/core/ui/icon/Icon.tsx` | Icon wrapper with extended sizes (xs, xl, xxl) | Lucide icons |
| **RoundedIcon** | `src/core/ui/icon/RoundedIcon.tsx` | Icon in rounded badge (filled/outlined variants) | Custom icon badge |
| **RoundedBadge** | `src/core/ui/icon/RoundedBadge.tsx` | Circular badge (medium/small/xsmall) | `Badge` (shadcn) |

### Images & Media

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **Image** | `src/core/ui/image/Image.tsx` | Box as img with error handling | `<img>` with fallback |
| **ImageBlurredSides** | `src/core/ui/image/ImageBlurredSides.tsx` | Image with blurred side effect | Custom CSS filter |
| **MediaGallery** | `src/core/ui/gallery/MediaGallery.tsx` | Image gallery with fullscreen dialog | `Carousel` / `Dialog` (shadcn) |

### Markdown

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **WrapperMarkdown** | `src/core/ui/markdown/WrapperMarkdown.tsx` | Markdown renderer with custom components for headings, links, media, code | `react-markdown` + Tailwind prose |
| **OverflowGradient** | `src/core/ui/overflow/OverflowGradient.tsx` | Gradient fade for overflowing content | Custom CSS gradient mask |
| **AutomaticOverflowGradient** | `src/core/ui/overflow/AutomaticOverflowGradient.tsx` | Auto-detecting overflow gradient | Custom CSS gradient mask |

### Data Tables

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **DataGridTable** | `src/core/ui/table/DataGridTable.tsx` | MUI X DataGrid wrapper | `Table` (shadcn) / `@tanstack/react-table` |

### Misc Display

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **LabeledCount** | `src/core/ui/content/LabeledCount.tsx` | Count display | Custom stat component |
| **BadgeCardView** | `src/core/ui/list/BadgeCardView.tsx` | List item with visual badge (avatar/icon) on left | Custom list item |
| **TagsComponent** | `src/domain/shared/components/TagsComponent/TagsComponent.tsx` | Tag/chip display | `Badge` (shadcn) list |
| **LocationCardSegment** | `src/core/ui/location/LocationCardSegment.tsx` | City + country display | Custom text row |

---

## 5. CARD COMPONENTS (Surfaces)

### Core Card System

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **ContributeCard** | `src/core/ui/card/ContributeCard.tsx` | **Base card component** (Paper with elevation-on-hover, optional RouterLink/onClick). CONTRIBUTE_CARD_COLUMNS=3. Used by ALL card variants. | `Card` (shadcn) |
| **ContributeCardSkeleton** | `src/core/ui/card/ContributeCardSkeleton.tsx` | Loading skeleton for cards | `Skeleton` (shadcn) |
| **CardHeader** | `src/core/ui/card/CardHeader.tsx` | Card header with icon, title, author avatar. Uses BadgeCardView + RoundedIcon | `CardHeader` (shadcn) |
| **CardHeaderCaption** | `src/core/ui/card/CardHeaderCaption.tsx` | Subtitle/caption with optional logo | `CardDescription` (shadcn) |
| **CardHeaderDetail** | `src/core/ui/card/CardHeaderDetail.tsx` | Icon + text detail row | Custom row |
| **CardImageHeader / CardBanner** | `src/core/ui/card/CardImageHeader.tsx` | Banner image with gradient overlay (CARD_BANNER_GRADIENT) | Custom image header |
| **CardImage** | `src/core/ui/card/CardImage.tsx` | Image with aspect ratio (16/10 default) + fallback | `AspectRatio` + `<img>` |
| **CardContent** | `src/core/ui/card/CardContent.tsx` | Box with paddingX=1.5 | `CardContent` (shadcn) |
| **CardDetails** | `src/core/ui/card/CardDetails.tsx` | Box with optional transparent bg | Card body area |
| **CardDescription** | `src/core/ui/card/CardDescription.tsx` | Markdown description with OverflowGradient (4 gutters height) | `CardDescription` (shadcn) |
| **CardDescriptionWithTags** | `src/core/ui/card/CardDescriptionWithTags.tsx` | Description + tags combined | Card body + tags |
| **CardFooter** | `src/core/ui/card/CardFooter.tsx` | Flex footer (space-between, height: 2 gutters) | `CardFooter` (shadcn) |
| **CardFooterAvatar** | `src/core/ui/card/CardFooterAvatar.tsx` | Small avatar (2.5 spacing) for footers | `Avatar` small |
| **CardFooterBadge** | `src/core/ui/card/CardFooterBadge.tsx` | Avatar + caption badge in footer | Custom footer badge |
| **CardFooterCountWithBadge** | `src/core/ui/card/CardFooterCountWithBadge.tsx` | Count with icon badge | Custom counter |
| **CardActions** | `src/core/ui/card/CardActions.tsx` | Actions container (space-between, wrapping) | Card action area |
| **CardTags** | `src/core/ui/card/CardTags.tsx` | Tags/chips display for cards | `Badge` list |
| **CardRibbon** | `src/core/ui/card/CardRibbon.tsx` | Ribbon overlay at card bottom | Custom ribbon |
| **CardExpandButton** | `src/core/ui/card/CardExpandButton.tsx` | Expand/collapse chevron | `ChevronDown` icon |
| **ExpandableCardFooter** | `src/core/ui/card/ExpandableCardFooter.tsx` | Expandable footer with Collapse animation | `Collapsible` (shadcn) |
| **CardSegmentCaption** | `src/core/ui/card/CardSegmentCaption.tsx` | Caption segment with icon | Custom segment |
| **MessageCounter** | `src/core/ui/card/MessageCounter.tsx` | Message count indicator | `Badge` with count |
| **ContributorTooltip** | `src/core/ui/card/ContributorTooltip.tsx` | Tooltip showing UserCard on hover (deprecated) | `HoverCard` (shadcn) |

### Domain-Specific Cards

| Component | Location | Purpose |
|-----------|----------|---------|
| **SpaceCardBase** | `src/domain/space/components/cards/SpaceCardBase.tsx` | Space card with banner, tags, lock icon, compact/regular modes |
| **SpaceCard** | `src/domain/space/components/cards/SpaceCard.tsx` | Full space card |
| **SpaceCardHorizontal** | `src/domain/space/components/cards/SpaceCardHorizontal.tsx` | Horizontal space card |
| **UserCard** | `src/domain/community/user/userCard/UserCard.tsx` | User profile card with avatar, location, contact |
| **ContributorCard** | `src/domain/community/contributor/ContributorCard/ContributorCard.tsx` | Contributor with banner, location, expandable tags |
| **ContributorCardSquare** | `src/domain/community/contributor/ContributorCardSquare/ContributorCardSquare.tsx` | Square contributor chip |
| **ContributorCardHorizontal** | `src/core/ui/card/ContributorCardHorizontal.tsx` | Horizontal contributor layout |
| **ContributionCard** | `src/domain/community/contributor/Contributions/ContributionCard.tsx` | Space contribution with leave action |
| **CalloutCard** | `src/domain/collaboration/callout/calloutCard/CalloutCard.tsx` | Callout card with author, description, tags |
| **PostCard** | `src/domain/collaboration/calloutContributions/post/PostCard.tsx` | Post contribution card |
| **WhiteboardCard** | `src/domain/collaboration/calloutContributions/whiteboard/WhiteboardCard.tsx` | Whiteboard contribution card |
| **CalendarEventCard** | `src/domain/timeline/calendar/views/CalendarEventCard.tsx` | Calendar event card |
| **TemplateCard** | `src/domain/templates/components/cards/TemplateCard.tsx` | Template card (switches by type) |
| **InnovationPackCard** | `src/domain/InnovationPack/InnovationPackCard/InnovationPackCard.tsx` | Innovation pack card |
| **ScrollableCardsLayoutContainer** | `src/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer.tsx` | Scrollable card carousel container |

---

## 6. INPUT COMPONENTS

### Form Fields (Formik-wrapped)

| Component | Location | MUI Base | Purpose | shadcn/ui Equivalent |
|-----------|----------|----------|---------|---------------------|
| **FormikInputField** | `src/core/ui/forms/FormikInputField/FormikInputField.tsx` | `TextField` | **Primary text input** with label, error, char counter, help icon, loading state | `Input` + `Label` + `FormMessage` (shadcn) |
| **FormikMarkdownField** | `src/core/ui/forms/MarkdownInput/FormikMarkdownField.tsx` | `OutlinedInput` + custom WYSIWYG | Rich markdown editor with toolbar, image upload, char counter | `Textarea` + custom toolbar |
| **FormikSelect** | `src/core/ui/forms/FormikSelect.tsx` | `Select` + `MenuItem` | Dropdown select with icon support | `Select` (shadcn) |
| **FormikAutocomplete** | `src/core/ui/forms/FormikAutocomplete.tsx` | `Autocomplete` + `TextField` | Autocomplete/combobox | `Combobox` (shadcn) |
| **FormikMultiSelect** | `src/core/ui/forms/FormikMultiSelect.tsx` | `Autocomplete` + `Chip` | Multi-select with chips | Multi-select `Combobox` |
| **FormikCheckboxField** | `src/core/ui/forms/FormikCheckboxField.tsx` | `Checkbox` + `FormControlLabel` | Checkbox with label | `Checkbox` (shadcn) |
| **FormikSwitch** | `src/core/ui/forms/FormikSwitch.tsx` | `Switch` + `FormControlLabel` | Toggle switch | `Switch` (shadcn) |
| **FormikRadiosSwitch** | `src/core/ui/forms/FormikRadiosSwitch.tsx` | `Radio` + `InputLabel` | Radio button group | `RadioGroup` (shadcn) |
| **FormikRadioButtonsGroup** | `src/core/ui/forms/radioButtons/FormikRadioButtonsGroup.tsx` | Custom button-style radios | Button-styled radio selection | `ToggleGroup` (shadcn) |
| **FormikDatePicker** | `src/core/ui/forms/DatePicker/FormikDatePicker.tsx` | MUI X `DatePicker` | Date picker | `DatePicker` (shadcn) |
| **FormikTimePicker** | `src/core/ui/forms/DatePicker/FormikTimePicker.tsx` | Custom `Select` dropdown | Time picker (custom, not MUI TimePicker) | Custom time select |
| **FormikDurationMinutes** | `src/core/ui/forms/DatePicker/FormikDurationMinutes.tsx` | Custom `Select` | Duration as end-time | Custom duration select |
| **FormikFileInput** | `src/core/ui/forms/FormikFileInput/FormikFileInput.tsx` | `TextField` + upload button | File URL input with upload | Custom file input |
| **FormikCommentInputField** | `src/domain/communication/room/Comments/FormikCommentInputField.tsx` | `OutlinedInput` + emoji/mention buttons | Chat message input with mentions + emoji | Custom chat input |
| **TagsInput** | `src/core/ui/forms/tagsInput/TagsInput.tsx` | `Autocomplete` + `Chip` | Free-text tag input | Custom tag input |
| **SearchField** | `src/core/ui/search/SearchField.tsx` | `TextField` with search icon | Search input | `Input` with search icon |
| **SeamlessSelect** | `src/core/ui/forms/select/SeamlessSelect.tsx` | `Select` (borderless) | Minimal inline dropdown | Custom borderless select |
| **KratosInput** | `src/core/auth/authentication/components/Kratos/KratosInput.tsx` | `TextField` | Auth form field (Kratos identity) | `Input` (shadcn) |
| **CharacterCounter** | `src/core/ui/forms/characterCounter/CharacterCounter.tsx` | – | Character count display | Custom counter |
| **MarkdownInput** | `src/core/ui/forms/MarkdownInput/MarkdownInput.tsx` | Custom WYSIWYG | Markdown editor core component | Custom editor |
| **CollaborativeMarkdownInput** | `src/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInput.tsx` | Custom | Real-time collaborative markdown editor | Custom collaborative editor |
| **EmojiSelector** | `src/core/ui/forms/emoji/EmojiSelector.tsx` | Custom | Emoji picker popover | Emoji picker |
| **CountrySelect** | `src/domain/common/location/CountrySelect.tsx` | `Autocomplete` | Country autocomplete | `Combobox` with country list |

### Button Components

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **Button** | MUI `@mui/material` | Standard button (variant: contained/outlined/text) | `Button` (shadcn) |
| **IconButton** | MUI `@mui/material` | Icon-only button | `Button` variant="ghost" size="icon" |
| **FullWidthButton** | `src/core/ui/button/FullWidthButton.tsx` | Button with `width: 100%` | `Button` className="w-full" |
| **FullscreenButton** | `src/core/ui/button/FullscreenButton.tsx` | Fullscreen toggle IconButton | Custom icon button |
| **SendButton** | `src/core/ui/actions/SendButton.tsx` | Button with SendIcon, variant contained | `Button` with send icon |
| **HelpButton** | `src/core/ui/button/HelpButton.tsx` | Help icon with tooltip | `Button` + `Tooltip` |
| **FloatingActionButtons** | `src/core/ui/button/FloatingActionButtons.tsx` | Fixed-position floating button container | Custom FAB container |
| **ButtonBaseAlignReset** | `src/core/ui/button/ButtonBaseAlignReset.tsx` | Reset button alignment for card clicks | Utility wrapper |
| **BackButton** | `src/core/ui/actions/BackButton.tsx` | Back navigation button | `Button` with back icon |
| **DeleteButton** | `src/core/ui/actions/DeleteButton.tsx` | Delete action button | `Button` destructive variant |

### Action Containers

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **Actions** | `src/core/ui/actions/Actions.tsx` | Flex row for action buttons (justify-end) | `div` with flex |
| **ActionsBar** | `src/core/ui/actions/ActionsBar/ActionsBar.tsx` | Row-reverse flex container for actions | `div` with flex-row-reverse |

---

## 7. FEEDBACK / OVERLAY COMPONENTS

### Dialog System

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **DialogWithGrid** | `src/core/ui/dialog/DialogWithGrid.tsx` | **Primary dialog wrapper**: MUI Dialog + Grid system integration. Supports columns (default 4), fullHeight, centeredVertically, fullScreen (auto on mobile). Uses GridContainer, GridProvider, GridItem internally. | `Dialog` (shadcn) |
| **DialogHeader** | `src/core/ui/dialog/DialogHeader.tsx` | Dialog header: title with icon + close button + actions. Uses BlockTitleWithIcon + ActionsBar | `DialogHeader` (shadcn) |
| **DialogFooter** | `src/core/ui/dialog/DialogWithGrid.tsx` (export) | Fragment wrapper for dialog footer content | `DialogFooter` (shadcn) |
| **DialogContent** | MUI `@mui/material` | Standard dialog content area (customized with gutters padding) | `DialogContent` (shadcn) |
| **DialogActions** | MUI `@mui/material` | Standard dialog actions area | `DialogFooter` (shadcn) |
| **ConfirmationDialog** | `src/core/ui/dialogs/ConfirmationDialog.tsx` | Confirmation dialog with title, content, cancel/confirm buttons | `AlertDialog` (shadcn) |
| **SearchDialog** | `src/main/search/SearchDialog.tsx` | Full-search dialog (12 columns) | `CommandDialog` (shadcn) |

### Loading & Progress

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **Loading** | `src/core/ui/loading/Loading.tsx` | Loading indicator | `Spinner` / skeleton |
| **CircularProgress** | MUI `@mui/material` | Circular loading spinner | Custom spinner |
| **Skeleton** | MUI `@mui/material` | Content placeholder (wave animation default) | `Skeleton` (shadcn) |

### Tooltips & Popovers

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **Tooltip** | MUI `@mui/material` | Hover tooltip | `Tooltip` (shadcn) |
| **ContributorTooltip** | `src/domain/community/contributor/ContributorTooltip/ContributorTooltip.tsx` | Contributor preview on hover | `HoverCard` (shadcn) |

### Notifications

| Component | Location | Purpose | shadcn/ui Equivalent |
|-----------|----------|---------|---------------------|
| **Slide** | MUI `@mui/material` | Slide-in animation (used for nav bar) | CSS transitions |
| **Collapse** | MUI `@mui/material` | Expand/collapse animation | `Collapsible` (shadcn) |
| **ClickAwayListener** | MUI `@mui/material` | Click-outside detection | `useClickOutside` hook |

---

## 8. MUI COMPONENT OVERRIDES (`src/core/ui/themes/default/components/`)

These MUI components have **custom theme overrides** and are used directly (not wrapped):

| MUI Component | Override File | Key Customizations |
|---------------|--------------|-------------------|
| **MuiButton** | `MuiButton.ts` | Custom padding per size, focus-visible with highlight palette, `disableRipple: true` |
| **MuiButtonBase** | `MuiButtonBase.ts` | `disableRipple: true`, focus-visible highlight.main bg |
| **MuiAvatar** | `MuiAvatar.ts` | Default variant: `rounded` |
| **MuiChip** | `MuiChip.ts` | Custom small/medium height, custom icon/label sizing, default size: 'small' |
| **MuiDialog** | `MuiDialog.ts` | Custom maxHeight: `100vh - navHeight - 2 gutters` |
| **MuiDialogContent** | `MuiDialogContent.ts` | Padding: `gutters()`, border colors from `neutralMedium` |
| **MuiDialogActions** | `MuiDialogActions.ts` | Padding: `gutters()` |
| **MuiPaper** | `MuiPaper.ts` | Rounded variant: `overflow: hidden` |
| **MuiLink** | `MuiLink.ts` | No underline default, hover: primary.main |
| **MuiMenuItem** | `MuiMenuItem.ts` | Padding: `gutters(0.5)`, uppercase text |
| **MuiTab** | `MuiTab.ts` | Minimal padding, auto minWidth |
| **MuiSelect** | `MuiSelect.ts` | Fix endAdornment overlap with arrow icon |
| **MuiSkeleton** | `MuiSkeleton.ts` | Wave animation default |
| **MuiIcon** | `MuiIcon.ts` | Custom fontSizeSmall(24), fontSizeLarge(36) |
| **MuiBottomNavigationAction** | `MuiBottomNavigationAction.ts` | Padding: 0, minWidth: spacing(8) |
| **MuiFormHelperText** | `MuiFormHelperText.ts` | Margin: 0 |

---

## 9. FREQUENTLY USED MUI IMPORTS (Direct Usage)

These MUI components are imported directly throughout the codebase without custom wrappers:

| MUI Component | Usage Pattern | shadcn/ui Equivalent |
|---------------|--------------|---------------------|
| `Box` | Universal flex/grid container (most used MUI component) | `div` with Tailwind |
| `Paper` | Surface with elevation | `Card` (shadcn) |
| `Typography` | Text rendering (via custom wrappers above) | HTML elements + Tailwind |
| `Button` | Actions, submit, navigation | `Button` (shadcn) |
| `IconButton` | Icon-only actions | `Button` ghost + icon |
| `Chip` | Tags, status badges | `Badge` (shadcn) |
| `Avatar` | User/space avatars (via custom wrapper) | `Avatar` (shadcn) |
| `TextField` | Form inputs (via FormikInputField) | `Input` (shadcn) |
| `Select` + `MenuItem` | Dropdowns | `Select` (shadcn) |
| `Autocomplete` | Comboboxes | `Combobox` (shadcn) |
| `Dialog` | Modals (via DialogWithGrid) | `Dialog` (shadcn) |
| `DialogContent` | Dialog body | `DialogContent` |
| `DialogActions` | Dialog footer buttons | `DialogFooter` |
| `Drawer` | Mobile side menu | `Sheet` (shadcn) |
| `AppBar` | Navigation bar | Custom sticky nav |
| `Tabs` + `Tab` | Tab navigation | `Tabs` (shadcn) |
| `Menu` + `MenuList` + `MenuItem` | Dropdown menus | `DropdownMenu` (shadcn) |
| `Tooltip` | Hover tooltips | `Tooltip` (shadcn) |
| `Skeleton` | Loading placeholders | `Skeleton` (shadcn) |
| `Collapse` | Expand/collapse animation | `Collapsible` (shadcn) |
| `Slide` | Slide animation | CSS transitions |
| `CircularProgress` | Loading spinner | Spinner |
| `FormControl` + `FormGroup` + `FormControlLabel` | Form layout | Form primitives |
| `OutlinedInput` | Custom styled input | `Input` variant |
| `InputLabel` | Form labels | `Label` (shadcn) |
| `FormHelperText` | Error/help text | `FormMessage` |
| `Checkbox` | Checkbox input | `Checkbox` (shadcn) |
| `Switch` | Toggle switch | `Switch` (shadcn) |
| `Radio` | Radio input | `RadioGroup` (shadcn) |
| `Link` | External links | `<a>` |
| `Divider` | Visual separator | `Separator` (shadcn) |
| `GridLegacy` | Legacy grid (MUI Grid v1) | Tailwind grid |
| `BottomNavigation` + `BottomNavigationAction` | Mobile bottom nav | Custom bottom nav |

---

## 10. KEY PATTERNS TO PRESERVE

### Grid + Gutters Pattern
```
TopLevelLayout
  └── PlatformNavigationBar (breadcrumbs)
  └── PageBanner (header)
  └── PageContent (main, sets up grid)
       └── PageContentColumn (columns=3|4|9|12)
            └── PageContentBlock (outlined Paper)
                 └── PageContentBlockHeader (title + actions)
                 └── Gutters (spacing wrapper)
                 └── PageContentBlockGrid (card grid)
                      └── ContributeCard (3-column card)
```

### Dialog Pattern
```
DialogWithGrid (columns=4|6|8|12, fullScreen auto on mobile)
  └── DialogHeader (title + icon + close + actions)
  └── DialogContent (gutter-padded)
       └── Gutters / PageContentColumn / Forms
  └── DialogActions / Actions
```

### Card Pattern
```
ContributeCard (Paper + GridItem + RouterLink/onClick + elevation-on-hover)
  └── CardHeader (icon + title + author avatar via BadgeCardView)
       └── CardHeaderCaption (subtitle + logo)
  └── CardImage / CardBanner (aspect ratio + gradient overlay)
  └── CardDetails (body container)
       └── CardDescription (markdown + overflow gradient)
       └── CardDescriptionWithTags
  └── CardFooter (space-between flex)
       └── CardFooterBadge / CardFooterAvatar / MessageCounter
  └── ExpandableCardFooter (collapsible extra content)
```

### SwapColors Pattern
Used for "accent" blocks — inverts primary and background colors:
```tsx
<PageContentBlock accent>  // Triggers SwapColors
  <BlockTitle>...</BlockTitle>  // Now renders in paper color on primary bg
</PageContentBlock>
```

### withElevationOnHover
HOC that adds elevation change on hover to Paper components (used by ContributeCard).

---

## 11. FILE STRUCTURE SUMMARY

```
src/core/ui/
├── actions/          # Actions, ActionsBar, SendButton, BackButton, DeleteButton
├── avatar/           # Avatar (custom sizes)
├── button/           # FullWidthButton, FullscreenButton, FloatingActionButtons, HelpButton
├── card/             # ContributeCard, CardHeader, CardFooter, CardImage, etc.
├── content/          # PageContent, PageContentBlock (all variants), headers, footers
├── dialog/           # DialogWithGrid, DialogHeader
├── dialogs/          # ConfirmationDialog
├── forms/            # FormikInputField, FormikSelect, FormikMarkdownField, DatePicker, etc.
├── gallery/          # MediaGallery
├── grid/             # Gutters, GridProvider, GridItem, GridContainer, constants, utils
├── icon/             # Icon, RoundedIcon, RoundedBadge
├── image/            # Image, ImageBlurredSides
├── keyboardNavigation/  # SkipLink, BlockAnchorProvider
├── layout/           # PageBanner, PageBannerCardWrapper
├── link/             # RouterLink, ConditionalLink
├── list/             # BadgeCardView
├── loading/          # Loading
├── location/         # LocationCardSegment
├── markdown/         # WrapperMarkdown, custom renderers
├── navigation/       # NavigationBar, Breadcrumbs, BreadcrumbsItem
├── overflow/         # OverflowGradient, AutomaticOverflowGradient
├── palette/          # SwapColors, palette definition
├── scroll/           # Scroll utilities
├── search/           # SearchField
├── table/            # DataGridTable
├── themes/           # Theme definition, component overrides, RootThemeProvider
├── typography/       # PageTitle, BlockTitle, Text, Caption, etc.
├── upload/           # VisualUpload, FileUpload
└── utils/            # Centered, Overlay, FlexSpacer, ElevationContext
```
