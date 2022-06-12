import { DELAY_TIME } from "./constants";
import { PositiveBlockData, PositiveLastBlockData } from "./types";

export const isPositiveBlockData = (data: any): data is PositiveBlockData =>
  data.result && data.result.transactions instanceof Array;

export const isPositiveLastBlockData = (
  data: any
): data is PositiveLastBlockData =>
  data.result && typeof parseInt(data.result, 16) === "number";

export const delay = () =>
  new Promise((resolve) => setTimeout(resolve,DELAY_TIME));

