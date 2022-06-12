import axios from "axios";
import Block from "./Block";
import { DOWN_LIMIT } from "./constants";
import { Counter } from "./Counter";
import { EtherTransaction } from "./db/models/etherTransaction.model.ts";
import { isPositiveLastBlockData } from "./helper";
import { Queue } from "./Queue";
import { EBlockStatus, ESaverStatus } from "./types";

export class Saver {
  private upQueue: Queue<Block> = new Queue();
  private downQueue: Queue<Block> = new Queue();
  private upLimit: number;
  private downLimit: number = DOWN_LIMIT;
  private upCounter: Counter = new Counter(1);
  private downCounter: Counter = new Counter(-1);
  private status: ESaverStatus = ESaverStatus.EMPTY;

  constructor(
    private maxUpQueueLength: number = 10,
    private maxDownQueueLength: number = 10
  ) {}

  public async start() {
    await this.setInitialValues();
    console.log(this);

    while (true) {
      this.fillUpQueue();
      this.fillDownQueue();
      console.log("Save upQueue blocks");
      await this.saveBlocksFromQueue(this.upQueue, this.upCounter);
      console.log("Save downQueue blocks");
      await this.saveBlocksFromQueue(this.downQueue, this.downCounter);
      console.log("Update values");
      await this.setUpLimitValue();
      console.log(this);
    }
  }

  private async setUpLimitValue() {
    const { data } = await axios("https://api.etherscan.io/api", {
      params: {
        module: "proxy",
        action: "eth_blockNumber",
        apikey: process.env.API_KEY,
      },
    });

    if (!isPositiveLastBlockData(data)) {
      console.log(`Too early refetching last block`);
      this.status = ESaverStatus.FAILED_FETCHING;
      return;
    }

    this.upLimit = parseInt(data.result, 16);
  }

  private async initUpCounter(): Promise<void> {
    this.upCounter.value = await EtherTransaction.max("block");
  }

  private async initDownCounter(): Promise<void> {
    this.downCounter.value = await EtherTransaction.min("block");
  }

  private async setInitialValues(): Promise<void> {
    await this.setUpLimitValue();
    // we have to have some records in DB to start
    if (this.upCounter.value && this.downCounter.value) {
      this.status = ESaverStatus.NOT_EMPTY;
      return;
    }

    const anyBlock = await EtherTransaction.findOne();

    if (anyBlock) {
      await Promise.all([this.initUpCounter(), this.initDownCounter()]);
      this.status = ESaverStatus.NOT_EMPTY;
      return;
    }

    // if DB has no records, we save first
    const block = new Block(this.upLimit);
    await block.save();
    if (block.status === EBlockStatus.SAVED) {
      this.upCounter.value = this.upLimit;
      this.downCounter.value = this.upLimit;
      this.status = ESaverStatus.NOT_EMPTY;
      return;
    }
  }

  private fillUpQueue(): void {
    if (!this.upCounter.value) {
      throw new Error("Firstly set this.upCounter.value");
    }

    let localCounter = this.upCounter.value;

    while (
      this.upQueue.length < this.maxUpQueueLength &&
      localCounter < this.upLimit
    ) {
      if (!this.upQueue.length) {
        // first Block in the Queue
        this.upQueue.push(new Block(this.upCounter.value + 1));
      } else {
        // Other Blocks in the Queue
        this.upQueue.push(new Block(this.upQueue.last.blockValue + 1));
      }

      localCounter += 1;
    }
  }
  private fillDownQueue(): void {
    if (!this.downCounter.value) {
      throw new Error("Firstly set this.upCounter.value");
    }

    let localCounter = this.downCounter.value;

    while (
      this.downQueue.length < this.maxDownQueueLength &&
      localCounter > this.downLimit
    ) {
      if (!this.downQueue.length) {
        // first Block in the Queue
        this.downQueue.push(new Block(this.downCounter.value - 1));
      } else {
        // Other Blocks in the Queue
        this.downQueue.push(new Block(this.downQueue.last.blockValue - 1));
      }

      localCounter -= 1;
    }
  }

  private async saveBlocksFromQueue(
    queue: Queue<Block>,
    counter: Counter
  ): Promise<void> {
    while (true) {
      const block = queue.pop();
      if (!block) {
        break;
      }

      await block.save();
      counter.move();
    }
  }
}
