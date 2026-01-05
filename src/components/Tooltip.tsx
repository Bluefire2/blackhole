
import type { ComponentChildren } from 'preact';

interface TooltipProps {
    text: string;
    children: ComponentChildren;
}

export function Tooltip({ text, children }: TooltipProps) {
    return (
        <div class="tooltip-container">
            {children}
            <div class="tooltip-content">{text}</div>
        </div>
    );
}
