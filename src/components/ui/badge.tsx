import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 tracking-wide font-mono',
  {
    variants: {
      variant: {
        default:
          'border-sky-200 bg-sky-50 text-sky-700 shadow-xs',
        secondary:
          'border-slate-200 bg-slate-100 text-slate-700',
        outline:
          'border-slate-300 text-slate-600 bg-white',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-xs',
        warning:
          'border-amber-200 bg-amber-50 text-amber-700 shadow-xs',
        destructive:
          'border-rose-200 bg-rose-50 text-rose-700 shadow-xs',
        indigo:
          'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-xs',
        purple:
          'border-purple-200 bg-purple-50 text-purple-700 shadow-xs',
        neutral:
          'border-slate-200 bg-slate-900 text-white shadow-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
