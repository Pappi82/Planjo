'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IParkingLotItem } from '@/types';
import { ArrowRight, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IdeaCardProps {
  item: IParkingLotItem & { relatedProjectIds?: any[] };
  onEdit: (item: IParkingLotItem) => void;
  onDelete: (id: string) => void;
  onConvert: (item: IParkingLotItem) => void;
}

export default function IdeaCard({ item, onEdit, onDelete, onConvert }: IdeaCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/12 bg-white/[0.05] p-6 text-white shadow-[0_22px_44px_rgba(5,8,26,0.45)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.1]">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div
          className="absolute -top-14 right-10 h-40 w-40 rounded-full blur-[110px]"
          style={{ backgroundColor: priorityAccent(item.priority) }}
        />
      </div>
      <div className="relative z-10 space-y-5">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {formatDate(item.createdAt)}
            </p>
          </div>
          <Badge
            variant="outline"
            className="rounded-full border-white/25 px-3 py-1 text-[0.65rem] uppercase tracking-[0.35em]"
            style={{ color: priorityAccent(item.priority) }}
          >
            {item.priority}
          </Badge>
        </header>

        {item.description ? <p className="text-sm leading-relaxed text-white/75">{item.description}</p> : null}

        {item.tags && item.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {item.relatedProjectIds && item.relatedProjectIds.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs">
            {item.relatedProjectIds.map((project: any) => (
              <Badge
                key={project._id}
                variant="secondary"
                className="rounded-full border border-white/15 bg-white/10 text-[0.65rem]"
                style={{ borderLeft: `3px solid ${project.colorTheme || '#8c6ff7'}` }}
              >
                {project.title}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" className="rounded-full" onClick={() => onConvert(item)}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Convert
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full border border-white/10 bg-white/5 text-destructive hover:text-destructive"
            onClick={() => onDelete(item._id.toString())}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function priorityAccent(priority: string) {
  switch (priority) {
    case 'urgent':
      return '#ff5c87aa';
    case 'high':
      return '#f9a826aa';
    case 'low':
      return '#38f8c7aa';
    default:
      return '#6f9effaa';
  }
}
