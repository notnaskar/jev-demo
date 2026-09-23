import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 select-none active:scale-[0.98] cursor-pointer shadow-xs',
  {
    variants: {
      variant: {
        default:
          'bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-slate-900',
        primary:
          'bg-sky-600 text-white hover:bg-sky-700 shadow-sm shadow-sky-600/20 border border-sky-600',
        secondary:
          'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80',
        outline:
          'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300',
        ghost:
          'text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-none',
        destructive:
          'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 shadow-none',
        emerald:
          'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-none',
        glow:
          'bg-slate-900 text-white hover:bg-slate-800 shadow-md',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-10 rounded-lg px-5 text-sm font-semibold',
        icon: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
