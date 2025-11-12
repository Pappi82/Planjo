'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IParkingLotItem } from '@/types';
import { ArrowRight, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IdeaCardProps {
  item: IParkingLotItem & { relatedProjectIds: any[] };
  onEdit: (item: IParkingLotItem) => void;
  onDelete: (id: string) => void;
  onConvert: (item: IParkingLotItem) => void;
}

export default function IdeaCard({ item, onEdit, onDelete, onConvert }: IdeaCardProps) {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/5 p-0 transition hover:border-white/30 hover:bg-white/10">
      <CardHeader className="px-6 pt-6 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl text-white">{item.title}</CardTitle>
            <CardDescription className="text-white/60">
              {formatDate(item.createdAt)}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-xs uppercase tracking-[0.2em]"
          >
            {item.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {item.description && (
          <p className="text-sm text-white/70">{item.description}</p>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {item.relatedProjectIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.relatedProjectIds.map((project: any) => (
              <Badge
                key={project._id}
                variant="secondary"
                className="text-xs"
                style={{ borderLeft: `3px solid ${project.colorTheme || '#8c6ff7'}` }}
              >
                {project.title}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" onClick={() => onConvert(item)}>
            <ArrowRight className="h-4 w-4 mr-1" />
            Convert to Task
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/70 hover:text-white"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(item._id.toString())}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
