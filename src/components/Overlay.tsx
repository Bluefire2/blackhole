
import { useState } from 'preact/hooks';
import type { OverlayMetrics } from '../renderer';

interface OverlayProps {
    metrics: OverlayMetrics;
}

export function Overlay({ metrics }: OverlayProps) {
    const [collapsed, setCollapsed] = useState(false);

    // Helper row component
    const Row = ({ label, value, unit = '', valueClass = '' }: { label: string, value: string, unit?: string, valueClass?: string }) => (
        <div class="overlay-row">
            <span class="overlay-label">{label}</span>
            <span>
                <span class={`overlay-value ${valueClass}`}>{value}</span>
                {unit && <span class="overlay-unit">{unit}</span>}
            </span>
        </div>
    );

    return (
        <div id="overlay" class={collapsed ? 'collapsed' : ''}>
            <div id="overlay-header">
                <span style={{ color: 'rgba(0,255,255,0.7)', fontSize: '0.8em', letterSpacing: '2px' }}>HUD</span>
                <button class="overlay-toggle-btn" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? 'SHOW' : 'HIDE'}
                </button>
            </div>

            <div id="overlay-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* System Section */}
                <div class="overlay-section">
                    <div class="overlay-section-title">System</div>
                    {metrics.fps !== undefined && <Row label="FPS" value={metrics.fps.toFixed(1)} />}
                    {metrics.time !== undefined && <Row label="Sim Time" value={metrics.time.toFixed(1)} unit="s" />}
                    {metrics.resolution && <Row label="Res" value={metrics.resolution} />}
                    {metrics.maxRaySteps !== undefined && <Row label="Max Steps" value={metrics.maxRaySteps.toString()} />}
                </div>

                {/* Camera Section */}
                <div class="overlay-section">
                    <div class="overlay-section-title">Camera</div>
                    {metrics.fov !== undefined && <Row label="FOV" value={(metrics.fov * 180 / Math.PI).toFixed(1)} unit="°" />}
                    {metrics.pitch !== undefined && <Row label="Pitch" value={metrics.pitch.toFixed(1)} unit="°" />}
                    {metrics.yaw !== undefined && <Row label="Yaw" value={metrics.yaw.toFixed(1)} unit="°" />}
                    {metrics.roll !== undefined && <Row label="Roll" value={metrics.roll.toFixed(1)} unit="°" />}
                </div>

                {/* Position Section */}
                <div class="overlay-section">
                    <div class="overlay-section-title">Position</div>
                    {metrics.distance !== undefined && <Row label="Distance" value={metrics.distance.toFixed(2)} unit="Rₛ" />}
                    {metrics.distanceToHorizon !== undefined && (
                        <Row
                            label="Dist to Horizon"
                            value={metrics.distanceToHorizon.toFixed(3)}
                            unit="Rₛ"
                            valueClass={metrics.distanceToHorizon < 0.1 ? 'danger' : metrics.distanceToHorizon < 0.5 ? 'warning' : ''}
                        />
                    )}
                </div>

                {/* Physics Section */}
                <div class="overlay-section">
                    <div class="overlay-section-title">Physics</div>
                    {metrics.metric && (
                        <div class="overlay-row">
                            <span class="overlay-label">Metric</span>
                            <span class="overlay-value">
                                {metrics.metric === 'Schwarzschild' ? (
                                    <a href="https://en.wikipedia.org/wiki/Schwarzschild_metric" target="_blank" rel="noopener noreferrer">Schwarzschild&nbsp;↗</a>
                                ) : (
                                    <a href="https://en.wikipedia.org/wiki/Kerr_metric" target="_blank" rel="noopener noreferrer">Kerr&nbsp;↗</a>
                                )}
                            </span>
                        </div>
                    )}
                    {metrics.frameDragOmega !== undefined && <Row label="Frame Drag Ω" value={metrics.frameDragOmega.toFixed(4)} unit="rad/s" />}
                    {metrics.orbitalVelocity !== undefined && <Row label="Orbital Vel" value={metrics.orbitalVelocity.toFixed(3)} unit="c" />}
                    {metrics.gForce !== undefined && <Row label="Local g" value={metrics.gForce.toFixed(3)} unit="c²/Rₛ" />}
                    {metrics.timeDilation !== undefined && <Row label="Time Dilation" value={metrics.timeDilation.toFixed(4)} />}
                    {metrics.redshift !== undefined && (
                        <Row label="Redshift z" value={isFinite(metrics.redshift) ? (metrics.redshift >= 0 ? '+' : '') + metrics.redshift.toFixed(4) : '∞'} />
                    )}
                </div>
            </div>
        </div>
    );
}
