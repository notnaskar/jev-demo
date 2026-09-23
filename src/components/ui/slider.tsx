'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  indicatorColor?: string;
}

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, indicatorColor = 'bg-sky-600', ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center py-1 cursor-pointer',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100 border border-slate-200">
      <SliderPrimitive.Range className={cn('absolute h-full transition-all', indicatorColor)} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-white bg-slate-900 shadow-sm ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
