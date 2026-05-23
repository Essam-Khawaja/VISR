import { Card } from "@/components/ui/Card";

type BottleneckCardProps = {
  bottleneck: string;
};

export function BottleneckCard({ bottleneck }: BottleneckCardProps) {
  return (
    <Card>
      <div className="p-5 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--danger)]">
          Bottleneck
        </p>
        <p className="font-display text-lg leading-snug text-[color:var(--text-primary)]">{bottleneck}</p>
      </div>
    </Card>
  );
}
