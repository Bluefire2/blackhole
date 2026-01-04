
import { useEffect, useState } from 'preact/hooks';

export function InteractionHint() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const dismiss = () => {
            setVisible(false);
            window.removeEventListener('mousedown', dismiss);
            window.removeEventListener('touchstart', dismiss);
            window.removeEventListener('keydown', dismiss);
        };

        window.addEventListener('mousedown', dismiss);
        window.addEventListener('touchstart', dismiss);
        window.addEventListener('keydown', dismiss);

        return () => {
            window.removeEventListener('mousedown', dismiss);
            window.removeEventListener('touchstart', dismiss);
            window.removeEventListener('keydown', dismiss);
        };
    }, []);

    if (!visible) return null;

    return (
        <div id="interaction-hint" className={!visible ? 'fade-out' : ''}>
            <div class="icon">🖐️</div>
            <div>Click & Drag</div>
            <div style={{ fontSize: '0.8em', opacity: 0.8 }}>to rotate camera</div>
        </div>
    );
}
