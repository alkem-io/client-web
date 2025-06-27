Callout Contributions can be enabled so users can contribute to callouts with posts, whiteboards, links ...
The ContributionSettingsDialog handles every type of contribution with a different component.
The component needs to be passed as a property contributionTypeSettingsComponent.

These specific components for each contribution type, need to expose a Ref, that will be called from the dialog when the user clicks Save button.
This API is:

- onSave
  The component will apply the user changes to the Formik state (of type CalloutFormSubmittedValues) so the data can be send to the server on callout creation
- isContentChanged
  The dialog will call this function to check if the content has been changed to prevent the users to lose data in case they close the back button or close the dialog.

So important to have in mind while developing a new contribution type:
- There are two states,
  - The Formik state, which is of type CalloutFormSubmittedValues and it is what it's going to be sent to the server on createCallout mutation or updateCalloutMutation and should be as similar as possible to the corresponding *Inputs
  - Each individual form state by contribution type, which can be a whiteboard, or a post default description...

  The component is responsible of updating the Formik state when the user hits save button (onSave), and is responsible of checking if any content changed when the user wants to close the settings dialog.

---

Another thing to have in mind, the dialog has a set of switches at the bottom, these switches follow the same API for consistency. They are just a different ref, but also implement this same onSave/isContentChanged interface.