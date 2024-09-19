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
