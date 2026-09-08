import { Package, RefreshCw, Layers } from "lucide-react";

const items = [
  { icon: Package, title: "Complimentary shipping", copy: "On every preview order" },
  { icon: RefreshCw, title: "30-day returns", copy: "If it is not the one" },
  { icon: Layers, title: "One catalog", copy: "Published from the dashboard" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border/70 bg-card/60">
      <div className="mx-auto grid max-w-6xl divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3 px-4 py-5">
            <item.icon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
