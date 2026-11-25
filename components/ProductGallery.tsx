"use client";

import Image from "next/image";
import { useState } from "react";
import ProductImage from "./ProductImage";
import AddToEnquiry from "./enquiry/AddToEnquiry";

/**
 * Product gallery: images fade in as they load, and the active image gets a gentle
 * hover zoom. The first image is the LCP candidate, so it loads eagerly.
 *
 * The frame has a fixed aspect ratio and the image fills it, so the browser can
 * pick a correctly sized source before the image arrives; `sizes` describes the
 * real column width at each breakpoint rather than defaulting to the viewport.
 */
export default function ProductGallery({
  images,
  name,
  enquiry,
}: {
  images: string[];
  name: string;
  enquiry: { slug: string; name: string; brand: string; category: string; href: string };
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="group relative flex aspect-[4/3] max-h-[28rem] items-center justify-center overflow-hidden border border-navy-900/10 bg-ice p-8">
        {images.length ? (
          <ProductImage
            src={images[active]}
            alt={`${name} image ${active + 1}`}
            priority
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 90vw, 92vw"
            className="max-h-full"
            imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span className="eyebrow text-navy-900/70">Product image unavailable</span>
        )}
      </div>
      {images.length > 1 ? (
        <ul className="mt-4 flex gap-3 overflow-x-auto pb-1" aria-label={`${name} images`}>
          {images.map((image, index) => (
            <li key={image}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-pressed={active === index}
                className={`relative flex h-20 w-20 items-center justify-center overflow-hidden border bg-ice p-2 transition-colors ${active === index ? "border-cyan-deep" : "border-navy-900/15 hover:border-navy-900/35"}`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="5rem"
                  className="object-contain p-2"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6">
        <AddToEnquiry item={{ ...enquiry, image: images[0] }} className="w-full sm:w-auto" />
      </div>
    </div>
  );
}
