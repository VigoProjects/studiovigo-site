/**
 * Colour themes for service pages. Each theme sets the hero gradient and the floating
 * decorative shapes (images in /public/permanent-assets/<folder>/).
 */
export type Theme = "blue" | "purple" | "pink";

export const themes: Record<Theme, {
  gradient: string;
  folder: string;
  /** Floating shapes beside the article, with parallax speed (negative = drifts up). */
  decorations: { src: string; class: string; speed: number }[];
}> = {
  blue: {
    gradient: "gradient-hero-blue",
    folder: "theme-blue",
    decorations: [
      { src: "body-1.png", class: "right-0 top-1/8 w-[116px]", speed: -0.2 },
      { src: "body-2.png", class: "left-0 top-1/2 w-[151px]", speed: -0.15 },
    ],
  },
  purple: {
    gradient: "gradient-hero-purple",
    folder: "theme-purple",
    decorations: [
      { src: "body-1.png", class: "right-0 top-1/8 w-[118px]", speed: -0.2 },
      { src: "body-2.png", class: "left-0 top-1/2 w-[130px]", speed: -0.15 },
    ],
  },
  pink: {
    gradient: "gradient-hero-pink",
    folder: "theme-pink",
    decorations: [
      { src: "body-1.png", class: "right-0 top-1/8 w-[200px]", speed: -0.2 },
      { src: "body-2.png", class: "left-0 top-1/2 w-[137px]", speed: -0.15 },
      { src: "body-3.png", class: "right-0 bottom-1/8 w-[135px]", speed: -0.1 },
    ],
  },
};
