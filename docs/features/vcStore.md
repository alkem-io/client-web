### Technical Documentation for Implementing Virtual Contributors Store v1

#### Overview

This document outlines the technical plan for implementation of the Invite VCs dialog a.k.a. 'VC Store' - [#7256](https://github.com/alkem-io/client-web/issues/72560). Ideally, the functionality should be reusable for different contributor types (User, Organization, VC) and can be placed in various contexts.

#### Components and Areas Affected

1. **ContributorCard Component** (Existing): A reusable component for displaying contributors. Already available the hover card with details (TBD).
2. **ContributorList Component**: A component to display a list of contributors using the `ContributorCard` component.
3. **ContributorDetailsOverlay Component** - A reusable component for displaying the details of a contributor plus functionality to invite (similar to the templates' details).
4. **InviteContributorsDialog Component**: A dialog component to display lists of contributors. This one would have specifics related to the ability and availability of adding contributors under an Account.
5. **VirtualContributorsBlock Component** (Existing): The main component that integrates the `InviteContributorsDialog`.
6. **useContributors Hook**: A custom hook to handle the business logic for fetching and managing contributors. The hook should provide the available data based on the context (space/account/community) and the methods for sending an invite or adding to a community.
   Note that some logic is already present in the `useCommunityAdmin`.
