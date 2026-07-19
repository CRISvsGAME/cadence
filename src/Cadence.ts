import { CadenceState } from "./CadenceState.js";
import type { CadenceFrameCallback } from "./CadenceFrame.js";

export class Cadence {
    #state: CadenceState = CadenceState.STOPPED;
    #subscribers: Set<CadenceFrameCallback> = new Set();

    public get state(): CadenceState {
        return this.#state;
    }

    public stop(): void {
        const state = this.#state;

        if (state === CadenceState.RUNNING || state === CadenceState.PAUSED) {
            this.#state = CadenceState.STOPPED;
        }
    }

    public start(): void {
        const state = this.#state;

        if (state === CadenceState.DESTROYED) {
            throw new Error("Cadence: Cannot start a destroyed instance.");
        }

        if (state !== CadenceState.RUNNING) {
            this.#state = CadenceState.RUNNING;
        }
    }

    public pause(): void {
        if (this.#state === CadenceState.RUNNING) {
            this.#state = CadenceState.PAUSED;
        }
    }

    public destroy(): void {
        if (this.#state === CadenceState.DESTROYED) {
            return;
        }

        this.#state = CadenceState.DESTROYED;
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
