import { createFileRoute } from "@tanstack/react-router";
import { InvestorCarousel } from "@workspace/ui/components/pitch/investor-carousel";

export const Route = createFileRoute("/_marketing/company")({
  component: InvestorPage,
});

function InvestorPage() {
  return (
    <main className="bg-muted overflow-hidden">
      <section className="bg-muted">
        <div className="mx-auto max-w-6xl border-x px-3">
          <div className="border-x">
            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div className="px-3 py-16 md:px-6 md:py-24">
              <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-background shadow-lg">
                <InvestorCarousel />
              </div>
            </div>
            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-foreground/10">
        <div className="mx-auto max-w-6xl border-x px-3">
          <div className="border-x h-0" />
        </div>
      </section>
    </main>
  );
}
