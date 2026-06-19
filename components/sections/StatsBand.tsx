import { Container } from "@/components/ui/Container";
import { Stat } from "@/components/ui/Stat";
import { stats } from "@/content/stats";

export function StatsBand() {
  if (!stats || stats.length === 0) return null;
  return (
    <section className="bg-peach/40 py-14">
      <Container>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </Container>
    </section>
  );
}
