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

So in our implementation in `WhiteboardVisuals/getWhiteboardPreviewImage.ts` we:

- Receive excalidrawAPI to obtain the elements, appState and files required for the export
- Calculate from the elements the exportPadding, it's a 10% of the biggest dimension (width or height), (Excalidraw's default is 10 pixels in all the cases).
- ExportToCanvas the entire whiteboard, because of the limitations of the getDimensions function we cannot do much cropping/resizing before actually exporting it.
- If exportToCanvas fails we generate a fallback image in `createFallbackWhiteboardPreview.ts`

### `WhiteboardPreviewSettings` and `WhiteboardPreviewCustomSelectionDialog`

Cropping cordinates are "Real Whiteboards Coordinates" that means, cropping area may be out of the max/min width/height restrictions of the whiteboard visuals, it's the desired area to crop in whiteboard's generated image coordinates.
In the WhiteboardPreviewCustomSelection dialog, there's a translation function, because the React-Crop component, performs the cropping on visual image coordinates, so we have:

- Real whiteboard coordinates (for example 10000 x 10000)
- Cropping coordinates (what fits in the cropping dialog, usually around 1200 pixels width)
  Those cropping coordinates get translated onLoad and onSave to real whiteboard coordinates and saved in the database in the WhiteboardSettings.

If for whatever reason, (for example a big chunk of content of the whiteboard gets removed) the cropping coordinates are not valid any more for an existing whiteboard, the default cropping is applied.

### `useGenerateWhiteboardVisuals`

This is the hook that prepares the visuals of a whiteboard.

- Generates a single image using `getWhiteboardPreviewImage`
- Crops and resizes as needed
- Puts the visuals ready to be sent by `useUploadWhiteboardVisuals`

### `useUploadWhiteboardVisuals`

This hook uploads the visuals to the whiteboard profile

`useUploadWhiteboardVisuals`
