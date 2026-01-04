
import { useState } from 'preact/hooks';
import { Canvas } from './Canvas';
import { Controls } from './Controls';
import { InteractionHint } from './InteractionHint';
import { Overlay } from './Overlay';
import type { OverlayMetrics } from '../renderer';
import '../index.css';

export function App() {
    const [metric, setMetric] = useState<'Schwarzschild' | 'Kerr'>('Schwarzschild');
    const [spin, setSpin] = useState(0.9);
    const [useRedshift, setUseRedshift] = useState(true);
    const [resolution, setResolution] = useState(1.0);
    const [stepScale, setStepScale] = useState(1.0);
    const [useNoise, setUseNoise] = useState(false);
    const [metrics, setMetrics] = useState<OverlayMetrics>({});
    const [error, setError] = useState<string | null>(null);

    if (error) {
        return (
            <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
                <h1>Initialization Error</h1>
                <pre>{error}</pre>
            </div>
        );
    }

    return (
        <>
            <Canvas
                metric={metric}
                spin={spin}
                useRedshift={useRedshift}
                resolution={resolution}
                stepScale={stepScale}
                useNoise={useNoise}
                onStatsUpdate={setMetrics}
                onError={setError}
            />
            <Overlay metrics={metrics} />
            <Controls
                metric={metric} onMetricChange={setMetric}
                spin={spin} onSpinChange={setSpin}
                useRedshift={useRedshift} onRedshiftChange={setUseRedshift}
                resolution={resolution} onResolutionChange={setResolution}
                stepScale={stepScale} onStepScaleChange={setStepScale}
                useNoise={useNoise} onUseNoiseChange={setUseNoise}
            />
            <InteractionHint />
            <div id="controls-help">
                <div>Mouse Drag &rarr; Rotate</div>
                <div>Wheel &rarr; Zoom</div>
                <div><span class="key">Q</span><span class="key">E</span> &rarr; Roll</div>
            </div>
        </>
    );
}
