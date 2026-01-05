
interface ControlsProps {
    metric: 'Schwarzschild' | 'Kerr';
    onMetricChange: (m: 'Schwarzschild' | 'Kerr') => void;
    spin: number;
    onSpinChange: (s: number) => void;
    useRedshift: boolean;
    onRedshiftChange: (v: boolean) => void;
    resolution: number;
    onResolutionChange: (v: number) => void;
    stepScale: number;
    onStepScaleChange: (v: number) => void;
    useNoise: boolean;
    onUseNoiseChange: (v: boolean) => void;
}

import { Tooltip } from './Tooltip';


export function Controls(props: ControlsProps) {
    return (
        <div id="controls">
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Physics settings</div>

            <div class="control-row">
                <label>Metric</label>
                <Tooltip direction="left" text="Choose the spacetime metric. Schwarzschild = static, Kerr = rotating.">
                    <span class="info-icon">?</span>
                </Tooltip>



                <div class="segmented-control" id="metric-control">
                    <input
                        type="radio" name="metric" value="Schwarzschild" id="metric-sch"
                        checked={props.metric === 'Schwarzschild'}
                        onChange={() => props.onMetricChange('Schwarzschild')}
                    />
                    <label for="metric-sch">Schwarzschild</label>
                    <input
                        type="radio" name="metric" value="Kerr" id="metric-kerr"
                        checked={props.metric === 'Kerr'}
                        onChange={() => props.onMetricChange('Kerr')}
                    />
                    <label for="metric-kerr">Kerr</label>
                </div>
                <span></span>
            </div>

            <div class="control-row" id="spin-row" style={{ display: props.metric === 'Kerr' ? 'grid' : 'none' }}>
                <label for="spin-slider">Spin (a)</label>
                <Tooltip direction="left" text="Angular momentum parameter (0 to 1). Determines frame dragging and horizon shape.">
                    <span class="info-icon">?</span>
                </Tooltip>



                <input
                    id="spin-slider" type="range" min="0.0" max="0.99" step="0.01"
                    value={props.spin}
                    onInput={(e) => props.onSpinChange(Number(e.currentTarget.value))}
                />
                <span id="spin-value">{props.spin.toFixed(2)}</span>
            </div>

            <div class="control-row">
                <label for="use-redshift">Enable Redshift</label>
                <Tooltip direction="left" text="Toggle gravitational redshift and Doppler beaming effects.">
                    <span class="info-icon">?</span>
                </Tooltip>



                <input
                    id="use-redshift" type="checkbox"
                    checked={props.useRedshift}
                    onChange={(e) => props.onRedshiftChange(e.currentTarget.checked)}
                />
                <span></span>
            </div>

            <div style="margin-bottom: 0.5rem;"></div>

            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Performance settings</div>

            <div class="control-row">
                <label for="render-scale">Resolution</label>
                <Tooltip direction="left" text="Render at a lower internal resolution and upscale to fit the window size. Lower values increase FPS but reduce sharpness.">
                    <span class="info-icon">?</span>
                </Tooltip>



                <input
                    id="render-scale" type="range" min="0.5" max="1" step="0.05"
                    value={props.resolution}
                    onInput={(e) => props.onResolutionChange(Number(e.currentTarget.value))}
                />
                <span id="render-scale-value">{Math.round(props.resolution * 100)}%</span>
            </div>

            <div class="control-row">
                <label for="step-scale">Integration step scale</label>
                <Tooltip direction="left" text="Scale the ray-marching step size. Higher values are faster but less accurate; lower values are slower but more accurate.">
                    <span class="info-icon">?</span>
                </Tooltip>



                <input
                    id="step-scale" type="range" min="0.5" max="2" step="0.1"
                    value={props.stepScale}
                    onInput={(e) => props.onStepScaleChange(Number(e.currentTarget.value))}
                />
                <span id="step-scale-value">{props.stepScale.toFixed(1)}×</span>
            </div>

            <div class="control-row">
                <label for="use-noise-texture">Use Noise Texture</label>
                <Tooltip direction="left" text="Enable to use a pre-calculated noise texture (faster). Disable to use procedural noise (slower).">
                    <span class="info-icon">?</span>
                </Tooltip>



                <input
                    id="use-noise-texture" type="checkbox"
                    checked={props.useNoise}
                    onChange={(e) => props.onUseNoiseChange(e.currentTarget.checked)}
                />
                <span></span>
            </div>
        </div>
    );
}
