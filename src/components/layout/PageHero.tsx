import { ReactNode } from 'react';

interface PageHeroProps {
  label: string;
  title: string;
  description: string;
  highlight?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}

export function PageHero({ label, title, description, highlight, actions, meta }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.05] p-8 text-white shadow-[0_26px_60px_rgba(2,4,12,0.55)]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-32 right-0 h-60 w-60 rounded-full bg-[#6f9eff]/25 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#ff5c87]/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,255,0.08),_transparent_65%)]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.4em] text-white/60">{label}</p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
            <p className="text-sm leading-relaxed text-white/70">{description}</p>
          </div>
          {highlight ? <div className="flex flex-wrap gap-3">{highlight}</div> : null}
        </div>
        <div className="flex w-full flex-col gap-4 lg:w-auto">
          {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">{actions}</div> : null}
          {meta ? <div className="text-sm text-white/60">{meta}</div> : null}
        </div>
      </div>
    </section>
  );
}

