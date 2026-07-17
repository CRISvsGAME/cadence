import { describe, expect, it } from "vitest";
import { Cadence, CadenceState } from "../src/index.ts";

describe("Cadence", () => {
    describe("constructor", () => {
        it("starts in the stopped state", () => {
            const cadence = new Cadence();

            expect(cadence.state).toBe(CadenceState.STOPPED);
        });
    });
});
