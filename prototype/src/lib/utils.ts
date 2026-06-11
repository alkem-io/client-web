import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display",
        "text-hero",
        "text-page-title",
        "text-section-title",
        "text-subsection-title",
        "text-subheader",
        "text-body",
        "text-body-emphasis",
        "text-control",
        "text-caption",
        "text-label",
        "text-sidebar-label",
        "text-badge",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
