/** Glow gradients for cards. `gradientFor(i)` cycles them across a list. */
export type Gradient = "coral-blue" | "purple-teal" | "teal-blue" | "coral-purple";
const ORDER: Gradient[] = ["coral-blue", "purple-teal", "teal-blue", "coral-purple"];
export const gradientFor = (i: number): Gradient => ORDER[i % ORDER.length];
