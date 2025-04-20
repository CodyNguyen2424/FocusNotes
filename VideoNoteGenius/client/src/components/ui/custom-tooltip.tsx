import { ReactNode, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { cn } from '@/lib/utils';

interface CustomTooltipProps {
  content: ReactNode;
  trigger: ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  showDelay?: number;
}

export function CustomTooltip({
  content,
  trigger,
  className,
  side = 'bottom',
  showDelay = 300,
}: CustomTooltipProps) {
  return (
    <Tooltip delayDuration={showDelay}>
      <TooltipTrigger asChild>
        {trigger}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className={cn("text-xs font-normal", className)}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
