import { ExitStatus } from "typescript";

export type Transaction = {
  from: string;
  to: string;
  value: string;
};

export type PositiveBlockData = {
  result: {
    transactions: Transaction[];
  };
};
export type PositiveLastBlockData = {
  result: string;
};

export type NegativeResponseData = {
  status: "0";
  message: "NOTOK";
  result: string;
};

export enum EBlockStatus {
  WAITING = "WAITING",
  DOWNLOADED = "DOWNLOADED",
  SAVED = "SAVED",
  FAILED_FETCHING = "FAILED_FETCHING",
  FAILED_SAVING = "FAILED_SAVING",
}

export enum ESaverStatus {
  EMPTY = "EMPTY",
  NOT_EMPTY = "NOT_EMPTY",
  FAILED_FETCHING = "FAILED_FETCHING",
}
