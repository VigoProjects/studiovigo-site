/** Generates /og/<page>.jpg share cards at build time. See src/lib/og.ts. */
import type { APIRoute, GetStaticPaths } from "astro";
import { shareCards, renderShareCard, type ShareCard } from "../../lib/og";

export const getStaticPaths: GetStaticPaths = async () =>
  [...(await shareCards())].map(([slug, card]) => ({ params: { slug }, props: { card } }));

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderShareCard(props.card as ShareCard)), {
    headers: { "Content-Type": "image/jpeg" },
  });
