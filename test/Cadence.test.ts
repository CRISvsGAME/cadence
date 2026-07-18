import { describe, expect, it } from "vitest";
import { Cadence, CadenceState } from "../src/index.ts";

describe("Cadence", () => {
    describe("constructor", () => {
        it("starts in the stopped state", () => {
            const cadence = new Cadence();

            expect(cadence.state).toBe(CadenceState.STOPPED);
        });
    });

    describe("stop", () => {
        it("transitions from running to stopped", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.stop();

            expect(cadence.state).toBe(CadenceState.STOPPED);
        });

        it("transitions from paused to stopped", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.pause();
            cadence.stop();

            expect(cadence.state).toBe(CadenceState.STOPPED);
        });

        it("is idempotent when already stopped", () => {
            const cadence = new Cadence();

            cadence.stop();

            expect(cadence.state).toBe(CadenceState.STOPPED);
        });
    });

    describe("start", () => {
        it("transitions from stopped to running", () => {
            const cadence = new Cadence();

            cadence.start();

            expect(cadence.state).toBe(CadenceState.RUNNING);
        });

        it("transitions from paused to running", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.pause();
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

    describe("pause", () => {
        it("transitions from running to paused", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.pause();

            expect(cadence.state).toBe(CadenceState.PAUSED);
        });

        it("does not transition from stopped to paused", () => {
            const cadence = new Cadence();

            cadence.pause();

            expect(cadence.state).toBe(CadenceState.STOPPED);
        });

        it("is idempotent when already paused", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.pause();
            cadence.pause();

            expect(cadence.state).toBe(CadenceState.PAUSED);
        });
    });
});
