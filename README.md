# Cadence

## Lightweight Animation Frame Coordination Library

Cadence is a lightweight, fully typed TypeScript library for coordinating a
single `requestAnimationFrame` loop across multiple subscribers.

It reports raw animation-frame timing and lifecycle state without clamping,
interpreting, or altering browser-provided timestamps. Each subscriber decides
how to handle large frame gaps, browser suspension, catch-up behaviour, and
animation-specific timing policies.

---

## 📦 Installation

Install from npm:

```bash
npm install @crisvsgame/cadence
```

Import the main class:

```typescript
import { Cadence } from "@crisvsgame/cadence";
```

---

## 🚀 Quick Start

```typescript
import { Cadence, type CadenceFrame } from "@crisvsgame/cadence";

const cadence = new Cadence();

const callback = (frame: CadenceFrame): void => {
    console.log(frame);
};

cadence.subscribe(callback);
cadence.start();
```

Each running Cadence instance owns one animation-frame loop and dispatches the
same `CadenceFrame` object to every active subscriber.

Stop receiving frames:

```typescript
cadence.unsubscribe(callback);
```

Stop and reset the timing sequence:

```typescript
cadence.stop();
```

Permanently release the instance:

```typescript
cadence.destroy();
```

---

## 🌐 CDN / Browser ESM

Cadence can also be imported directly in the browser through jsDelivr:

```html
<script type="module">
    import { Cadence } from "https://cdn.jsdelivr.net/npm/@crisvsgame/cadence@1.0.0/dist/index.js";

    const cadence = new Cadence();

    const callback = (frame) => {
        console.log(frame);
    };

    cadence.subscribe(callback);
    cadence.start();
</script>
```

---

## 🔧 Features

- Single shared `requestAnimationFrame` loop
- Multiple unique subscribers
- Raw RAF timestamp and delta reporting
- Cumulative elapsed timing
- Zero-based frame indexing
- Start, pause, stop, and destroy lifecycle controls
- Mutation-safe subscriber dispatch
- Subscriber exception isolation
- Zero runtime dependencies
- Fully typed TypeScript API

---

## ⏱️ Frame Timing

Each subscriber receives a `CadenceFrame`:

```typescript
type CadenceFrame = {
    readonly timestamp: DOMHighResTimeStamp;
    readonly delta: DOMHighResTimeStamp;
    readonly elapsed: DOMHighResTimeStamp;
    readonly frame: number;
};
```

### `timestamp`

The exact `DOMHighResTimeStamp` supplied by `requestAnimationFrame`.

### `delta`

The difference between the current RAF timestamp and the previous RAF timestamp
received by Cadence.

The first frame after starting or resuming reports:

```typescript
delta: 0;
```

Cadence does not clamp or reinterpret large deltas. If the browser delays RAF
delivery for three seconds while Cadence remains running, the next frame reports
that three-second gap.

### `elapsed`

The cumulative sum of raw frame deltas since the most recent stop.

`elapsed` is preserved across `pause()` and `start()`. Time spent intentionally
paused through Cadence is excluded because the first frame after resuming has a
delta of zero.

Time spent between RAF callbacks while Cadence remains running is included,
regardless of whether the delay was caused by browser throttling, tab
inactivity, operating-system suspension, main-thread work, or another external
condition.

### `frame`

A zero-based frame index.

The first frame reports:

```typescript
frame: 0;
```

The frame index is preserved across pause and resume, and reset by `stop()`.

---

## 🧭 Timing Responsibility

Cadence coordinates RAF delivery. It does not decide how animations should
interpret the reported timing.

A visual animation may clamp large deltas:

```typescript
const maxDelta = 100;

cadence.subscribe((frame) => {
    const animationDelta = Math.min(frame.delta, maxDelta);

    starfield.update(animationDelta);
});
```

A logical animation may consume the full delta:

```typescript
cadence.subscribe((frame) => {
    typewriter.update(frame.delta);
});
```

Visibility events, suspension handling, fixed-step simulation, catch-up limits,
and other timing policies belong to the consuming library or application.

---

## 🔄 Lifecycle

```typescript
cadence.start();
cadence.pause();
cadence.stop();
cadence.destroy();
```

### `start()`

Starts the RAF loop from the stopped state or resumes it from the paused state.

Calling `start()` while already running does nothing.

The first dispatched frame after starting or resuming reports a delta of zero.

Calling `start()` after destruction throws an error.

### `pause()`

Pauses the RAF loop while preserving elapsed time, frame index, and subscribers.

Calling `pause()` while stopped or already paused does nothing.

### `stop()`

Stops the RAF loop and resets elapsed time and frame index.

Subscribers remain registered and receive frames again after a later `start()`.

Calling `stop()` while already stopped does nothing.

### `destroy()`

Permanently stops the RAF loop and clears all subscribers.

Calling `destroy()` more than once does nothing. A destroyed instance cannot be
started or subscribed to again.

---

## 📡 Subscribers

Register a subscriber:

```typescript
const callback = (frame: CadenceFrame): void => {
    console.log(frame);
};

cadence.subscribe(callback);
```

Remove a subscriber:

```typescript
cadence.unsubscribe(callback);
```

Read the current number of subscribers:

```typescript
cadence.subscriberCount();
```

Subscribers are unique by callback identity:

```typescript
cadence.subscribe(callback);
cadence.subscribe(callback);

console.log(cadence.subscriberCount()); // 1
```

### Dispatch Contract

Subscribers are snapshotted at the beginning of each frame and processed in
subscription order.

- A subscriber present at the beginning of the frame is dispatched at most once.
- A subscriber removed before its turn is skipped.
- A subscriber added during dispatch begins on a subsequent frame.
- A subscriber removed and re-added before its turn remains eligible for one
  dispatch.
- Removing and re-adding a subscriber after its turn does not dispatch it again
  during the same frame.
- An exception thrown by one subscriber is logged and does not prevent other
  subscribers or later frames from being dispatched.

Cadence schedules the next animation frame before notifying subscribers. This
allows a subscriber to call `pause()`, `stop()`, or `destroy()` and cancel the
already scheduled request.

---

## 🎨 Public API

```typescript
new Cadence();

cadence.state;

cadence.start();
cadence.pause();
cadence.stop();
cadence.destroy();

cadence.subscribe(callback);
cadence.unsubscribe(callback);
cadence.subscriberCount();
```

Fully typed imports:

```typescript
import { Cadence, CadenceState, type CadenceFrame, type CadenceFrameCallback } from "@crisvsgame/cadence";
```

Lifecycle states:

```typescript
CadenceState.STOPPED;
CadenceState.RUNNING;
CadenceState.PAUSED;
CadenceState.DESTROYED;
```

---

## 📂 Project Structure

```bash
src/
    Cadence.ts
    CadenceFrame.ts
    CadenceState.ts
    index.ts
test/
    utils/
        AnimationFrameMock.ts
    Cadence.test.ts
dev/
    index.html
    main.css
    main.ts
dist/ # generated build output published to npm
    Cadence.d.ts
    Cadence.d.ts.map
    Cadence.js
    Cadence.js.map
    CadenceFrame.d.ts
    CadenceFrame.d.ts.map
    CadenceFrame.js
    CadenceFrame.js.map
    CadenceState.d.ts
    CadenceState.d.ts.map
    CadenceState.js
    CadenceState.js.map
    index.d.ts
    index.d.ts.map
    index.js
    index.js.map
.gitignore
LICENSE
README.md
package-lock.json
package.json
tsconfig.base.json
tsconfig.dev.json
tsconfig.json
tsconfig.test.json
```

---

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The test command type-checks the source and test suite before running Vitest.

The tests cover lifecycle transitions, RAF scheduling and cancellation, frame
timing, subscriber mutation during dispatch, subscriber exception isolation,
and animation-frame mock behaviour.

---

## 🛠️ Build

Build the library and development files:

```bash
npm run build
```

---

## 📝 License

MIT License

---

## 🔗 Links

- npm: https://www.npmjs.com/package/@crisvsgame/cadence
- Source Code: https://github.com/CRISvsGAME/cadence
