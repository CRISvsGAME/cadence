export type CadenceFrame = {
    readonly timestamp: DOMHighResTimeStamp;
    readonly delta: DOMHighResTimeStamp;
    readonly elapsed: DOMHighResTimeStamp;
    readonly frame: number;
};

export type CadenceFrameCallback = (frame: CadenceFrame) => void;
