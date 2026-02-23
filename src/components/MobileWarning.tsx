import { useState, useEffect } from 'preact/hooks';

function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;

    // Check touch support + small screen as primary signal
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;

    // Also check user agent for mobile keywords
    const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );

    return (hasTouch && isSmallScreen) || mobileUA;
}

interface MobileWarningProps {
    onProceed: () => void;
}

export function MobileWarning({ onProceed }: MobileWarningProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setVisible(true));
    }, []);

    return (
        <div id="mobile-warning" class={visible ? 'visible' : ''}>
            <div class="mobile-warning-card">
                <div class="warning-icon">⚠️</div>
                <h1>Mobile Device Warning</h1>

                <p class="warning-lead">
                    This app simulates a black hole by ray-tracing photon paths through
                    curved spacetime — <strong>entirely on your GPU, every frame</strong>.
                </p>

                <div class="warning-details">
                    <div class="detail-item">
                        <span class="detail-icon">🔥</span>
                        <span>Hundreds of numerical integration steps per pixel</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">📱</span>
                        <span>Mobile GPUs will struggle; expect very low FPS, extreme heat, and heavy battery drain. Your phone may freeze.</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">💻</span>
                        <span>For the best experience, use a desktop or laptop with a dedicated GPU</span>
                    </div>
                </div>

                <button class="proceed-btn" onClick={onProceed}>
                    I understand — continue anyway
                </button>
            </div>
        </div>
    );
}

export { isMobileDevice };
