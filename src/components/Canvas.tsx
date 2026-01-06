
import { useRef, useEffect } from 'preact/hooks';
import {
    startRenderLoop,
    setStepScale,
    setUseNoiseTexture,
    setMetric,
    setUseRedshift,
    setShowEventHorizon,
    type MetricType,
    type OverlayMetrics
} from '../renderer';
import { createCamera } from '../camera';
import { initWebGPU } from '../webgpu-setup';
import { setRenderScale } from '../utils';

interface CanvasProps {
    // We pass state down just to trigger side effects if needed, 
    // but mostly we call the setters directly when props change.
    metric: MetricType;
    spin: number;
    useRedshift: boolean;
    resolution: number;
    stepScale: number;
    useNoise: boolean;
    showEventHorizon: boolean;
    onStatsUpdate: (stats: OverlayMetrics) => void;
    onError: (msg: string) => void;
}

export function Canvas(props: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const initializedRef = useRef(false);

    // Apply side effects when props change
    useEffect(() => {
        setMetric(props.metric, props.spin);
    }, [props.metric, props.spin]);

    useEffect(() => {
        setUseRedshift(props.useRedshift);
    }, [props.useRedshift]);

    useEffect(() => {
        setRenderScale(props.resolution);
    }, [props.resolution]);

    useEffect(() => {
        setStepScale(props.stepScale);
    }, [props.stepScale]);



    useEffect(() => {
        setUseNoiseTexture(props.useNoise);
    }, [props.useNoise]);

    useEffect(() => {
        setShowEventHorizon(props.showEventHorizon);
    }, [props.showEventHorizon]);


    // Initialize WebGPU once
    useEffect(() => {
        if (initializedRef.current || !canvasRef.current) return;

        async function init() {
            if (!canvasRef.current) return;
            try {
                const canvas = canvasRef.current;

                // Setup camera
                const camera = createCamera(canvas);

                // Grab cursor logic
                canvas.addEventListener('mousedown', () => canvas.classList.add('grabbing'));
                canvas.addEventListener('mouseup', () => canvas.classList.remove('grabbing'));
                canvas.addEventListener('mouseleave', () => canvas.classList.remove('grabbing'));

                // Init WebGPU
                const resources = await initWebGPU(canvas);

                await startRenderLoop(canvas, resources, camera, props.onStatsUpdate);
                initializedRef.current = true;

            } catch (err: any) {
                props.onError(err.message || String(err));
            }
        }

        init();
    }, []);

    return <canvas id="gpu-canvas" ref={canvasRef} />;
}
