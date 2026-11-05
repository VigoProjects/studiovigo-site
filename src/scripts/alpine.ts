/**
 * Alpine.js powers the site's small interactions (menu, accordions, scroll reveals,
 * count-up stats). Ported from the original site's behaviour.
 */
import Alpine from "alpinejs";
import intersect from "@alpinejs/intersect";
import collapse from "@alpinejs/collapse";
import focus from "@alpinejs/focus";

/** Count-up number for stat cards: <dl x-data="statistic" data-value="42"> … <span x-ref="number"> */
Alpine.data("statistic", () => ({
  frame: 0 as number,
  start() {
    const raw = (this.$el as HTMLElement).dataset.value ?? "0";
    const target = Number(raw);
    const decimals = (raw.split(".")[1] || "").length;
    const fmt = new Intl.NumberFormat("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const set = (n: number) => { (this.$refs.number as HTMLElement).textContent = fmt.format(n); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return set(target);
    const t0 = performance.now();
    set(0);
    const tick = (t: number) => {
      const p = Math.min((t - t0) / 1400, 1);
      set(target * (1 - (1 - p) ** 3));
      if (p < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  },
  destroy() { cancelAnimationFrame(this.frame); },
}));

Alpine.plugin(intersect);
Alpine.plugin(collapse);
Alpine.plugin(focus);
(window as any).Alpine = Alpine;
Alpine.start();
