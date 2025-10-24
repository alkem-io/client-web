# Whiteboard Preview Image Handling

## Image generation

Whiteboards are exported by Excalidraw's API function [exportToCanvas](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export).

exportToCanvas receives:
|Name | Type | Default | Description |
|-----------------|-------------|-------------|-------------------------------------------------------|
|elements | Excalidraw Element | [] | The elements to be exported to canvas. |
|appState | AppState |Default App State | The app state of the scene. |
|files | BinaryFiles | _ | The files added to the scene. |
|exportPadding | number | 10 | The padding to be added on canvas. |
|getDimensions | function | _ | Described bellow. |
|maxWidthOrHeight | number | \_ | The maximum width or height of the exported image. If provided, `getDimensions` is ignored. |

`getDimensions`
A function which returns the width, height, and optionally scale (defaults to 1), with which canvas is to be exported.

```
(width: number, height: number) => {
  width: number,
  height: number,
  scale?: number
}
```

getDimensions is very limited, it receives the current whiteboard's size and returns the size dimensions that the crop should have. It doesn't allow x, y parameters to start the crop from a different area, allows that scale parameter but then you have to multiply by scale the width and height... it's a bit limited.

Excalidraw also offers other export functions but in the end they relay on exportToCanvas and then convert, and we need to resize and crop the image so the less conversions the better.

So in our implementation of the exporting in `WhiteboardVisuals/getWhiteboardPreviewImage.ts` we:

- Receive excalidrawAPI to obtain the elements, appState and files required for the export
- Calculate from the elements the exportPadding, it's a 10% of the biggest dimension (width or height), (Excalidraw's default is 10 pixels in all the cases).
- ExportToCanvas the entire whiteboard, because of the limitations of the getDimensions function we cannot do much cropping/resizing before actually exporting it.
- If exportToCanvas fails we generate a fallback image in `createFallbackWhiteboardPreview.ts`

### `WhiteboardPreviewSettings` and `WhiteboardPreviewCustomSelectionDialog` and the coordinates systems:

We can differentiate between 4 coordinates systems or image sizes:
1 - Excalidraw's elements coordinates - Used to calculate the export padding but not used anymore for preview generation.
2 - Excalidraw's exported image coordinates - Excalidraw exports the screenshot at full size, on big whiteboards can be images of around 10k pixels.
3 - React-Crop coordinates - If the exported image is too big for the user's screen, React-Crop will resize it, and the coordinates for cropping the image are relative to the presented image in the dialog, not to the real Excalidraw-exported image.
4 - Final exported preview - cropped and resized to the Visual desired dimensions (minWidth, minHeight, maxWidth, maxHeight).

In `whiteboard.previewSettings.coordinates` we always have Excalidraw's exported image coordinates at full scale (2). Cropping configs may be out of the max/min width/height restrictions of the whiteboard visuals (4) (around 1800x720), that is normal.
If the Whiteboard's real dimensions are smaller than the minimum Whiteboard's visual constraints (minWidth x minHeight 500x200) the whiteboard is exported with 2x scale automatically (See `getDimensions` in `getWhiteboardPreviewImage`). That can result in a jump of coordinates if saving a whiteboard that was very small and now it isn't but it's a corner case.

The React-Crop component occupies as much screen as it can, but sometimes (most of the times) it resizes the whiteboard screenshot. In these cases the coordinates (3) it gives are relative to the image printed in screen, not the real image coordinates. There's a translation function in the cropping dialog `WhiteboardPreviewCustomSelectionDialog`, that performs the translation between real coordinates (2) of the whiteboard screenshot and screen-visible coordinates for the React-Crop component (3).

If for whatever reason, (for example many elements of the whiteboard are removed), the cropping coordinates are not valid any more (`validateCropConfig` is used for validation)for an existing whiteboard, the default cropping (`getDefaultCropConfigForWhiteboardPreview`) is applied.

If when editing the whiteboard preview settings the user selects "Fixed" mode, the coordinates are saved and also the new previews are generated in that moment and uploaded.

### When the user closes the whiteboard dialog

- Preview settings are coming with the WhiteboardDetails for simplicity. May be a waste of space but that query was already quite big and saved some headaches to just add the previewSettings to the WhiteboardDetails Model instead of adding another query.
- If the `previewSettings.mode` is `Fixed`, no screenshot is generated and nothing happens.
- If the `previewSettings.mode` is `Auto`, or `Custom`, we call `getWhiteboardPreviewImage(excalidrawAPI)`. A screenshot is generated full size, or if very small twice the size (see previous point).
- If `mode` is custom and the cropConfiguration saved in `previewSettings.coordinates` is valid against the generated screenshot the crop config will be used, if not, the image will be automatically cropped to the maximum area of the same aspectRatio that fits in the screenshot, centered.
- We crop the image with `cropImage`
- Then we resize it with `resizeImage` (see the comments, it does smartly crop if the aspectRatio doesn't match)
- Then we resize (crop+resize) to generate the cardVisual from the whiteboardVisual
- Then we upload the visuals in `useUploadWhiteboardVisuals`

### `useGenerateWhiteboardVisuals`

This is the hook that prepares the visuals of a whiteboard.

- Generates a single image using `getWhiteboardPreviewImage`
- Crops and resizes as needed
- Puts the visuals ready to be sent by `useUploadWhiteboardVisuals`

### `useUploadWhiteboardVisuals`

This hook uploads the visuals to the whiteboard profile
