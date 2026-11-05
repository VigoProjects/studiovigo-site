/** Components available inside every .mdx file without importing them. */
import Text from "./Text.astro";
import Figure from "./Figure.astro";
import Stats from "./Stats.astro";
import Cards from "./Cards.astro";

export const mdxComponents = { Text, Figure, Stats, Cards };
