import { cn } from "@/lib/utils";

const steps = ["Bag", "Shipping", "Confirmed"] as const;

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-8 flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase">
      {steps.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3;
        return (
          <li key={label} className="flex items-center gap-2">
            {index > 0 ? <span className="text-border">/</span> : null}
            <span className={cn(step === current ? "text-foreground" : "text-muted-foreground")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
