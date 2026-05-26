# Screenshot source photos

These photos are used as the canvas background for the screenshots in
`docs/design/after-*.png` so the captures don't ship as monochrome mint.

| File         | Photographer  | Source URL                                |
| ------------ | ------------- | ----------------------------------------- |
| `coffee.jpg` | Nathan Dumlao | <https://unsplash.com/photos/4_mJ1TbMK8A> |

All photos are released under the [Unsplash License](https://unsplash.com/license),
which permits commercial use without attribution. We attribute anyway —
it's the kind thing to do.

## How to regenerate the screenshots

1. Start the dev server: `pnpm --filter @mint/web dev` (defaults to `http://localhost:3000`).
2. Adjust the port in the reshoot script if needed; the version used to
   produce the current captures pointed at `http://127.0.0.1:4173/`.
3. Run a Playwright script that seeds `localStorage["mint-project"]`
   with a document referencing the photo as a dataURL and the desired
   text layer, then takes the six screenshots.
4. Save the captures over `docs/design/after-*.png`.
