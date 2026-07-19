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

    describe("destroy", () => {
        it("transitions from stopped to destroyed", () => {
            const cadence = new Cadence();

            cadence.destroy();

            expect(cadence.state).toBe(CadenceState.DESTROYED);
        });

        it("transitions from running to destroyed", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.destroy();

            expect(cadence.state).toBe(CadenceState.DESTROYED);
        });

        it("transitions from paused to destroyed", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.pause();
            cadence.destroy();

            expect(cadence.state).toBe(CadenceState.DESTROYED);
        });

        it("is idempotent when already destroyed", () => {
            const cadence = new Cadence();

            cadence.destroy();
            cadence.destroy();

            expect(cadence.state).toBe(CadenceState.DESTROYED);
        });

        it("throws when starting a destroyed instance", () => {
            const cadence = new Cadence();

            cadence.destroy();

            expect(() => cadence.start()).toThrow();
            expect(cadence.state).toBe(CadenceState.DESTROYED);
        });
    });

    describe("subscribe", () => {
        it("registers a subscriber callback", () => {
            const cadence = new Cadence();
            const callback = (): void => {};

            cadence.subscribe(callback);

            expect(cadence.subscriberCount()).toBe(1);
        });

        it("does not register the same subscriber multiple times", () => {
            const cadence = new Cadence();
            const callback = (): void => {};

            cadence.subscribe(callback);
            cadence.subscribe(callback);

            expect(cadence.subscriberCount()).toBe(1);
        });

        it("registers multiple different subscribers", () => {
            const cadence = new Cadence();
            const callback1 = (): void => {};
            const callback2 = (): void => {};

            cadence.subscribe(callback1);
            cadence.subscribe(callback2);

            expect(cadence.subscriberCount()).toBe(2);
        });

        it("throws when subscribing to a destroyed instance", () => {
            const cadence = new Cadence();
            const callback = (): void => {};

            cadence.destroy();

            expect(() => cadence.subscribe(callback)).toThrow();
        });
    });

    describe("unsubscribe", () => {
        it("removes a subscriber callback", () => {
            const cadence = new Cadence();
            const callback = (): void => {};

            cadence.subscribe(callback);
            cadence.unsubscribe(callback);

            expect(cadence.subscriberCount()).toBe(0);
        });

        it("does nothing for an unknown subscriber", () => {
            const cadence = new Cadence();
            const callback = (): void => {};

            cadence.unsubscribe(callback);

            expect(cadence.subscriberCount()).toBe(0);
        });

        it("clears all subscribers when destroyed", () => {
            const cadence = new Cadence();
            const callback1 = (): void => {};
            const callback2 = (): void => {};

            cadence.subscribe(callback1);
            cadence.subscribe(callback2);
            cadence.destroy();

            expect(cadence.subscriberCount()).toBe(0);
        });
    });
});
