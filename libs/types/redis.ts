export const StateNew = "0";
export const StateAlreadyExisting = "1";

export type ProcessState = typeof StateNew | typeof StateAlreadyExisting;