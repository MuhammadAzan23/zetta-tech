# Content sources

Where each image and piece of third-party material on the site comes from, and what
its licence allows. Keep this file up to date whenever an asset is added.

## Thermal imagery

| Asset | Status | Source / licence |
|---|---|---|
| `public/images/thermal-hero.webp` | **Not present yet** — the site falls back to the illustrative `ThermalMap` SVG, captioned "Illustrative diagram". | To be supplied. Must be a frame from a Zetta Tech installation, or a stock thermal image with a licence that permits commercial web use. |
| `public/images/thermal-2.webp` | **Optional** — when present alongside `thermal-hero.webp`, the showcase becomes a before/after slider (colour frame as "before", thermal as "after"). | Same rules as above. Both frames must be the *same scene* for the slider to make sense. |

Rules for the real thermal image:

- Use our own installation footage where possible. Caption it "Sample thermal image"
  until a specific site is credited; when it is from a named installation, say so.
- Never take a thermal image from another security company's website, brochure or
  social account. Those are copyrighted and, worse, they imply work we did not do.
- If a stock image is used, record the photographer, the marketplace, the licence
  type and the purchase reference in the table above.

## Product photography

Product images in `public/catalog/images/` come from the supplier product feed
recorded in `lib/catalog.json` (`source`). They are used to identify the products we
sell and are not presented as our own photography.

## Logos

Brand logos or wordmarks, where used, are the trademarks of their owners and appear
to identify products we supply and install. `BrandLogos` looks for real files at
`public/brands/<slug>.svg|.png|.webp` at build time; when a file is missing the
marquee shows the brand name in the site's own type instead. No placeholder art and
no hotlinked third-party logo files are committed. To add a logo, save the
official file under `public/brands/` using the brand slug (`zkteco`, `ubiquiti`,
`ruijie-networks`, `mikrotik`, `dahua`, `imou`, `huawei-ekit`) and record its
source and permission in the table below.

| Asset | Status | Source / licence |
|---|---|---|
| `public/brands/*` | **None present yet** — brand names are rendered as the mark. | Use the vendor's own press/partner logo pack, supplied by the brand or its distributor. |

## Text

All site copy was written for Zetta Tech. Product descriptions are cleaned versions of
the supplier's own text; anything that arrived cut off or starting mid-sentence is
dropped rather than rewritten (see `lib/catalog-normalise.ts` and `data-audit.csv`).
