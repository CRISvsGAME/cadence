export const CadenceState = {
    STOPPED: 0,
    RUNNING: 1,
    PAUSED: 2,
    DESTROYED: 3,
} as const;

export type CadenceState = (typeof CadenceState)[keyof typeof CadenceState];
