import { vi } from "vitest";

export class AnimationFrameMock {
    #nextId: number = 1;
    #callbacks: Map<number, FrameRequestCallback> = new Map();

    #requestAnimationFrame = (callback: FrameRequestCallback): number => {
        const id = this.#nextId++;

        this.#callbacks.set(id, callback);

        return id;
    };

    #cancelAnimationFrame = (id: number): void => {
        this.#callbacks.delete(id);
    };

    #resetState(): void {
        this.#nextId = 1;
        this.#callbacks.clear();
    }

    public install(): void {
        vi.stubGlobal("requestAnimationFrame", vi.fn(this.#requestAnimationFrame));
        vi.stubGlobal("cancelAnimationFrame", vi.fn(this.#cancelAnimationFrame));
    }

    public reset(): void {
        this.#resetState();

        vi.mocked(requestAnimationFrame).mockClear();
        vi.mocked(cancelAnimationFrame).mockClear();
    }

    public uninstall(): void {
        this.#resetState();

        vi.unstubAllGlobals();
    }

    public dispatch(timestamp: DOMHighResTimeStamp): void {
        const callbacks = Array.from(this.#callbacks.values());

        this.#callbacks.clear();

        for (const callback of callbacks) {
            callback(timestamp);
        }
    }

    public pendingRequestCount(): number {
        return this.#callbacks.size;
    }
}
