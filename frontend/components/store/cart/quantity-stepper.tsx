import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuantityStepper({
  value,
  min = 1,
  max,
  disabled,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      >
        <Minus />
      </Button>
      <span className="w-8 text-center text-sm tabular-nums">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        <Plus />
      </Button>
    </div>
  );
}
