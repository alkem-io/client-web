Callout Contributions can be enabled so users can contribute to callouts with posts, whiteboards, links ...
The ContributionSettingsDialog handles every type of contribution with a different component.

These specific components for each contribution type, need to expose a Ref, that will be called from the dialog when the user clicks Save button.
This API is:

- onSave
  The component will apply the user changes to the Formik state (of type CalloutFormSubmittedValues) so the data can be send to the server on callout creation
- isContentChanged
  The dialog will call this function to check if the content has been changed to prevent the users to lose data in case they close the back button or close the dialog.
