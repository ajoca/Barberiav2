import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ServiceCard({ title, desc, price, tag }:{
  title: string; desc: string; price: string; tag?: string;
}) {
  return (
    <Card className="group border-border/60 bg-card/50 transition hover:border-primary/50 hover:shadow-glow">
      <CardContent className="p-5">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-medium tracking-wide">{title}</h3>
          {tag ? <Badge className="bg-primary/15 text-primary border border-primary/40">{tag}</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <div className="mt-4 text-right font-serif text-2xl text-primary">{price}</div>
      </CardContent>
    </Card>
  );
}
