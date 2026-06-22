import { Container } from "@/components/ui/Container";
import { Stat } from "@/components/ui/Stat";
import { stats } from "@/content/stats";

export function StatsBand() {
  if (!stats || stats.length === 0) return null;
  return (
    <section className="bg-peach/40 py-14">
      <Container>
        <div className="grid grid-cols-2 gap-y-8 gap-x-6 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s, i) => (
            <Stat
              key={s.label}
              value={s.value}
              label={s.label}
              // On the 2-col mobile grid, an odd count orphans the last stat in a
              // half-empty row — span it full-width so it centers. (sm/lg unaffected.)
              className={
                i === stats.length - 1 && stats.length % 2 === 1 ? "max-sm:col-span-2" : ""
              }
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
