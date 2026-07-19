import { CadenceState } from "./CadenceState.js";

export class Cadence {
    #state: CadenceState = CadenceState.STOPPED;

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
        if (this.#state !== CadenceState.DESTROYED) {
            this.#state = CadenceState.DESTROYED;
        }
    }
}
