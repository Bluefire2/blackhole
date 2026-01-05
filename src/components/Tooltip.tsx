
import type { ComponentChildren } from 'preact';

interface TooltipProps {
    text: string;
    children: ComponentChildren;
    direction?: 'left' | 'right';
}

export function Tooltip({ text, children, direction = 'left' }: TooltipProps) {
    return (
        <div class="tooltip-container">
            {children}
            <div class={`tooltip-content ${direction}`}>{text}</div>
        </div>
    );
}
