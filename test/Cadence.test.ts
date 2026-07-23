import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Cadence, CadenceState } from "../src/index.ts";
import { AnimationFrameMock } from "./utils/AnimationFrameMock.ts";
import type { CadenceFrame } from "../src/CadenceFrame.ts";

const animationFrameMock = new AnimationFrameMock();

beforeAll(() => {
    animationFrameMock.install();
});

beforeEach(() => {
    animationFrameMock.reset();
});

afterEach(() => {
    vi.restoreAllMocks();
});

afterAll(() => {
    animationFrameMock.uninstall();
});

describe("state", () => {
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

describe("animation frame", () => {
    describe("stop", () => {
        it("cancels the pending animation frame request when stopped", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.stop();

            expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
            expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
            expect(animationFrameMock.pendingRequestCount()).toBe(0);
        });

        it("resets elapsed time and frame index when restarted after stopping", () => {
            const cadence = new Cadence();
            const frames: CadenceFrame[] = [];

            const callback = (cadenceFrame: CadenceFrame): void => {
                frames.push(cadenceFrame);
            };

            cadence.subscribe(callback);
            cadence.start();

            animationFrameMock.dispatch(100);
            animationFrameMock.dispatch(200);

            cadence.stop();
            cadence.start();

            animationFrameMock.dispatch(1000);

            expect(frames[2]).toEqual({
                timestamp: 1000,
                delta: 0,
                elapsed: 0,
                frame: 0,
            });
        });
    });

    describe("start", () => {
        it("schedules an animation frame request when started", () => {
            const cadence = new Cadence();

            cadence.start();

            expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
            expect(animationFrameMock.pendingRequestCount()).toBe(1);
        });

        it("does not schedule another animation frame request when already running", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.start();

            expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
            expect(animationFrameMock.pendingRequestCount()).toBe(1);
        });
    });

    describe("pause", () => {
        it("cancels the pending animation frame request when paused", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.pause();

            expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
            expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
            expect(animationFrameMock.pendingRequestCount()).toBe(0);
        });

        it("preserves elapsed time and frame index when restarted after pausing", () => {
            const cadence = new Cadence();
            const frames: CadenceFrame[] = [];

            const callback = (cadenceFrame: CadenceFrame): void => {
                frames.push(cadenceFrame);
            };

            cadence.subscribe(callback);
            cadence.start();

            animationFrameMock.dispatch(100);
            animationFrameMock.dispatch(200);

            cadence.pause();
            cadence.start();

            animationFrameMock.dispatch(1000);

            expect(frames[2]).toEqual({
                timestamp: 1000,
                delta: 0,
                elapsed: 100,
                frame: 2,
            });
        });
    });

    describe("destroy", () => {
        it("cancels the pending animation frame request when destroyed", () => {
            const cadence = new Cadence();

            cadence.start();
            cadence.destroy();

            expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
            expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
            expect(animationFrameMock.pendingRequestCount()).toBe(0);
        });
    });

    describe("subscribe", () => {
        it("dispatches to subscribers on the next animation frame", () => {
            const cadence = new Cadence();
            let frame: CadenceFrame | undefined = undefined;

            const callback = vi.fn((cadenceFrame: CadenceFrame): void => {
                frame = cadenceFrame;
            });

            cadence.start();

            animationFrameMock.dispatch(100);

            cadence.subscribe(callback);

            expect(callback).toHaveBeenCalledTimes(0);
            expect(frame).toBeUndefined();

            animationFrameMock.dispatch(200);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(frame).toEqual({
                timestamp: 200,
                delta: 100,
                elapsed: 100,
                frame: 1,
            });
        });

        it("does not dispatch to subscribers added during the animation frame", () => {
            const cadence = new Cadence();
            const callback2 = vi.fn();

            const callback1 = vi.fn((): void => {
                cadence.subscribe(callback2);
            });

            cadence.subscribe(callback1);
            cadence.start();

            animationFrameMock.dispatch(100);

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(0);
        });

        it("dispatches to subscribers removed and re-added during the animation frame", () => {
            const cadence = new Cadence();
            const callback2 = vi.fn();

            const callback1 = vi.fn((): void => {
                cadence.unsubscribe(callback2);
                cadence.subscribe(callback2);
            });

            cadence.subscribe(callback1);
            cadence.subscribe(callback2);
            cadence.start();

            animationFrameMock.dispatch(100);

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });

        it("does not dispatch multiple times to the same subscriber during the frame", () => {
            const cadence = new Cadence();
            const callback2 = vi.fn();

            const callback1 = vi.fn((): void => {
                cadence.subscribe(callback2);
            });

            cadence.subscribe(callback1);
            cadence.subscribe(callback2);
            cadence.start();

            animationFrameMock.dispatch(100);

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });
    });

    describe("unsubscribe", () => {
        it("does not dispatch to subscribers on subsequent animation frames", () => {
            const cadence = new Cadence();
            const callback = vi.fn();

            cadence.subscribe(callback);
            cadence.start();

            animationFrameMock.dispatch(100);

            cadence.unsubscribe(callback);

            animationFrameMock.dispatch(200);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it("does not dispatch to subscribers removed before their turn", () => {
            const cadence = new Cadence();
            const callback2 = vi.fn();

            const callback1 = vi.fn((): void => {
                cadence.unsubscribe(callback2);
            });

            cadence.subscribe(callback1);
            cadence.subscribe(callback2);
            cadence.start();

            animationFrameMock.dispatch(100);

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(0);
        });

        it("dispatches to subscribers removed after their turn", () => {
            const cadence = new Cadence();
            const callback1 = vi.fn();

            const callback2 = vi.fn((): void => {
                cadence.unsubscribe(callback1);
            });

            cadence.subscribe(callback1);
            cadence.subscribe(callback2);
            cadence.start();

            animationFrameMock.dispatch(100);

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });
    });

    describe("scheduling", () => {
        it("schedules the next animation frame request after each dispatch", () => {
            const cadence = new Cadence();

            cadence.start();

            expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
            expect(animationFrameMock.pendingRequestCount()).toBe(1);

            animationFrameMock.dispatch(100);

            expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
            expect(animationFrameMock.pendingRequestCount()).toBe(1);

            animationFrameMock.dispatch(200);

            expect(requestAnimationFrame).toHaveBeenCalledTimes(3);
            expect(animationFrameMock.pendingRequestCount()).toBe(1);
        });

        it("allows a subscriber to cancel the next animation frame request", () => {
            const cadence = new Cadence();

            const callback = vi.fn((): void => {
                cadence.pause();
            });

            cadence.subscribe(callback);
            cadence.start();

            animationFrameMock.dispatch(100);

            expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
            expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
            expect(animationFrameMock.pendingRequestCount()).toBe(0);
            expect(cadence.state).toBe(CadenceState.PAUSED);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe("dispatching", () => {
        it("dispatches cadence frame objects to subscribers", () => {
            const cadence = new Cadence();
            const frames: CadenceFrame[] = [];

            const callback = (cadenceFrame: CadenceFrame): void => {
                frames.push(cadenceFrame);
            };

            cadence.subscribe(callback);
            cadence.start();

            animationFrameMock.dispatch(100);
            animationFrameMock.dispatch(200);
            animationFrameMock.dispatch(300);

            expect(frames).toEqual([
                { timestamp: 100, delta: 0, elapsed: 0, frame: 0 },
                { timestamp: 200, delta: 100, elapsed: 100, frame: 1 },
                { timestamp: 300, delta: 100, elapsed: 200, frame: 2 },
            ]);
        });

        it("dispatches the same cadence frame object to all subscribers", () => {
            const cadence = new Cadence();
            let frame1: CadenceFrame | undefined;
            let frame2: CadenceFrame | undefined;

            const callback1 = (cadenceFrame: CadenceFrame): void => {
                frame1 = cadenceFrame;
            };

            const callback2 = (cadenceFrame: CadenceFrame): void => {
                frame2 = cadenceFrame;
            };

            cadence.subscribe(callback1);
            cadence.subscribe(callback2);
            cadence.start();

            animationFrameMock.dispatch(100);

            expect(frame1).toBeDefined();
            expect(frame2).toBeDefined();
            expect(frame1).toBe(frame2);
        });

        it("continues to dispatch when a subscriber throws", () => {
            const cadence = new Cadence();
            const error = new Error("Subscriber Error");

            const errorCallback = vi.fn((): void => {
                throw error;
            });

            const successCallback = vi.fn();

            const consoleError = vi.spyOn(console, "error").mockImplementation((): void => {});

            cadence.subscribe(errorCallback);
            cadence.subscribe(successCallback);
            cadence.start();

            animationFrameMock.dispatch(100);
            animationFrameMock.dispatch(200);

            expect(errorCallback).toHaveBeenCalledTimes(2);
            expect(successCallback).toHaveBeenCalledTimes(2);
            expect(consoleError).toHaveBeenCalledTimes(2);
        });
    });
});
