import { CadenceState } from "./CadenceState.js";

export class Cadence {
    #state: CadenceState = CadenceState.STOPPED;

    public get state(): CadenceState {
        return this.#state;
    }
}
