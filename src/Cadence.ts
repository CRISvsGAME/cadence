import { CadenceState } from "./CadenceState.js";
import type { CadenceFrame, CadenceFrameCallback } from "./CadenceFrame.js";

export class Cadence {
    #state: CadenceState = CadenceState.STOPPED;
    #subscribers: Set<CadenceFrameCallback> = new Set();
    #animationFrameId: number | null = null;
    #previousTimestamp: DOMHighResTimeStamp | null = null;
    #elapsed: DOMHighResTimeStamp = 0;
    #frame: number = 0;

    #onAnimationFrame = (timestamp: DOMHighResTimeStamp): void => {
        this.#animationFrameId = null;

        if (this.#state !== CadenceState.RUNNING) {
            return;
        }

        const previousTimestamp = this.#previousTimestamp;
        const delta = previousTimestamp !== null ? timestamp - previousTimestamp : 0;
        const elapsed = this.#elapsed + delta;
        const frame = this.#frame;

        this.#previousTimestamp = timestamp;
        this.#elapsed = elapsed;
        this.#frame = frame + 1;

        const cadenceFrame: CadenceFrame = {
            timestamp,
            delta,
            elapsed,
            frame,
        };

        this.#animationFrameId = requestAnimationFrame(this.#onAnimationFrame);

        const subscribers = [...this.#subscribers];

        for (const subscriber of subscribers) {
            if (!this.#subscribers.has(subscriber)) {
                continue;
            }

            try {
                subscriber(cadenceFrame);
            } catch (error) {
                console.error("Cadence: Error in subscriber callback:", error);
            }
        }
    };

    #cancelAnimationFrame(): void {
        const animationFrameId = this.#animationFrameId;

        if (animationFrameId === null) {
            return;
        }

        cancelAnimationFrame(animationFrameId);
        this.#animationFrameId = null;
    }

    public get state(): CadenceState {
        return this.#state;
    }

    public stop(): void {
        const state = this.#state;

        if (state !== CadenceState.RUNNING && state !== CadenceState.PAUSED) {
            return;
        }

        this.#state = CadenceState.STOPPED;
        this.#cancelAnimationFrame();
        this.#elapsed = 0;
        this.#frame = 0;
    }

    public start(): void {
        const state = this.#state;

        if (state === CadenceState.DESTROYED) {
            throw new Error("Cadence: Cannot start a destroyed instance.");
        }

        if (state === CadenceState.RUNNING) {
            return;
        }

        this.#state = CadenceState.RUNNING;
        this.#previousTimestamp = null;
        this.#animationFrameId = requestAnimationFrame(this.#onAnimationFrame);
    }

    public pause(): void {
        if (this.#state !== CadenceState.RUNNING) {
            return;
        }

        this.#state = CadenceState.PAUSED;
        this.#cancelAnimationFrame();
    }

    public destroy(): void {
        if (this.#state === CadenceState.DESTROYED) {
            return;
        }

        this.#state = CadenceState.DESTROYED;
        this.#cancelAnimationFrame();
        this.#subscribers.clear();
    }

    public subscribe(callback: CadenceFrameCallback): void {
        if (this.#state === CadenceState.DESTROYED) {
            throw new Error("Cadence: Cannot subscribe to a destroyed instance.");
        }

        this.#subscribers.add(callback);
    }

    public unsubscribe(callback: CadenceFrameCallback): void {
        this.#subscribers.delete(callback);
    }

    public subscriberCount(): number {
        return this.#subscribers.size;
    }
}
