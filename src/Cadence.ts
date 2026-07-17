import { CadenceState } from "./CadenceState.js";

export class Cadence {
    #state: CadenceState = CadenceState.STOPPED;

    public get state(): CadenceState {
        return this.#state;
    }

    public start(): void {
        const state = this.#state;

        if (state !== CadenceState.RUNNING) {
            this.#state = CadenceState.RUNNING;
        }
    }
}
