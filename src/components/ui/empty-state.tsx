import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-dashed border-border p-10 text-center bg-card',
        className
      )}
    >
      <Icon className="w-12 h-12 mx-auto text-muted-foreground/60 mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      {description && <p className="text-muted-foreground mb-4">{description}</p>}
      {action}
    </div>
  );
}
