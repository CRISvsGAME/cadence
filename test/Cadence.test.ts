import { describe, expect, it } from "vitest";
import { Cadence, CadenceState } from "../src/index.ts";

describe("Cadence", () => {
    describe("constructor", () => {
        it("starts in the stopped state", () => {
            const cadence = new Cadence();

            expect(cadence.state).toBe(CadenceState.STOPPED);
        });
    });

    describe("start", () => {
        it("transitions from stopped to running", () => {
            const cadence = new Cadence();

            cadence.start();

            expect(cadence.state).toBe(CadenceState.RUNNING);
        });

        it("is idempotent when already running", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.start();

            expect(cadence.state).toBe(CadenceState.RUNNING);
        });
    });
});
