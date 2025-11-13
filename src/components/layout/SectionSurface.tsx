import { ReactNode } from 'react';

interface SectionSurfaceProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  bleed?: boolean;
}

export function SectionSurface({
  title,
  description,
  action,
  children,
  bleed = false,
}: SectionSurfaceProps) {
  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-white shadow-[0_24px_48px_rgba(4,7,24,0.5)]"
      data-bleed={bleed}
    >
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-12 left-20 h-48 w-48 rounded-full bg-[#38f8c7]/20 blur-[90px]" />
        <div className="absolute bottom-0 right-12 h-56 w-56 rounded-full bg-[#6f9eff]/18 blur-[100px]" />
      </div>
      <div className="relative z-10 space-y-6">
        {(title || description || action) && (
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl space-y-2">
              {title ? <h2 className="text-xl font-semibold text-white">{title}</h2> : null}
              {description ? <p className="text-sm text-white/65">{description}</p> : null}
            </div>
            {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
          </header>
        )}
        <div className={bleed ? '-mx-2 overflow-hidden rounded-[20px]' : undefined}>{children}</div>
      </div>
    </section>
  );
}

