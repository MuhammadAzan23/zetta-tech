# Brand logos

Drop real, official brand logo files here and the trust bar picks them up on the next
build. Files are named by brand slug, and the first match in this order wins:

```
public/brands/zkteco.svg
public/brands/zkteco.png
public/brands/zkteco.webp
```

Current slugs:

`zkteco`, `ubiquiti`, `ruijie-networks`, `mikrotik`, `dahua`, `imou`, `huawei-ekit`

If a slug has no file, the marquee shows the brand name in the site's own type. That is
the current state, and it is intentional — no placeholder mark is drawn and no logo is
hotlinked from a vendor site.

Guidance:

- Use the vendor's own press or partner logo pack, supplied by the brand or its
  distributor. Record the source and permission in `CONTENT-SOURCES.md`.
- Prefer SVG, or a transparent PNG/WebP at 2× the display height (about 72px tall).
- The file is rendered at a maximum height of 2rem with `object-fit`-safe intrinsic
  sizing, so a wide wordmark and a square mark both sit on the same baseline.
