export type CadenceFrame = {
    readonly timestamp: DOMHighResTimeStamp;
    readonly delta: DOMHighResTimeStamp;
    readonly elapsed: DOMHighResTimeStamp;
    readonly frame: number;
};

export type CadenceFrameCallback = (cadenceFrame: CadenceFrame) => void;
