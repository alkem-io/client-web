- In Models folder, models are as similar as possible to graphql Classes from queries,
  - nullable fields match nullable fields of Graphql Template)
  - Names are exactly the same as they come
- The XXSubmittedValues classes are as similar as possible to the Graphql XXUpdadateInput's
  - References expect ID, instead of id
- There are a few differences between Create and Update inputs

  - Tags are in the parent of the profile, not as tagsets inside the profile.
  - CreateProfileInput expects referencesData, but UpdateProfileInput expects just references
  - The file common/mappings.ts has all the ugly things, those `as`, those mappings that drive TypeScript crazy, put them in there
  - Update mappings are normally easier because the SubmittedValues classes are as similar as possible to the graphql UpdateTemplateInputs
  - In the query we retrieve `defaultTagset`, on update is turned into `tagsets` to send it as an UpdateTagsetInput, and on Create is sent as just `tags` at the parent level

- Avoid any casting or any ts-ignore, try to keep the types consistent!! Apart from the mappings file there shouldn't be any need for castings.

- List of places where templeates are used:

- List the things that remain undone

- leave the borders

Ask Neil

A few comments for bobby

- ugly stuff in mappings

# What to test:

- I would open two browsers, one in acc and one in develop and go through everywhere where there's a template and comparing.
- Styles have changed, there were lots of different components doing the same and now they are unified so many styles have changed, check that everything is relatively nice, or at least consistent. Maybe I have broken some responsiveness/mobile view, but I think I actually have fixed them using a single component that handles responsiveness correctly.

- Images, card visuals for the templates, I haven't been able to test that properly locally

  - whiteboard templates get the whiteboard screenshot as banner normally,

- Places where there are templates, or template related things:
  - Global Admin => Spaces settings => Templates
    There you can View, Edit, Create, Delete and Import from platform library
  - Global Admin => Innovation Packs => Innovation pack
  - Space => Create callout => Whiteboard => Edit => Find template
    In general in during any whiteboard you're editing you should be able to import a template
    Templates from the space should be available first, then templates from the platform
  - Space => Create callout => Call for posts => Find template
  - Space => Create callout => Call for Wbs => Find template
  - Space => Create callout => Have a look in the library!
  - (Same for subspaces, please check subspaces and sub-subspaces to check if they are loading correctly templates from their parent space)
  - Subspace => InnovationFlow settings
  - Space => Settings => Community => CommunityGuidelines
