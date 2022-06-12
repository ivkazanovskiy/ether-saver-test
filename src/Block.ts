import axios from "axios";
import { EtherTransaction } from "./db/models/etherTransaction.model.ts";
import { delay, isPositiveBlockData } from "./helper";
import { EBlockStatus, Transaction } from "./types";

// FIXME: rename, due to dump block.block
export default class Block {
  private tag: string;
  public status: EBlockStatus = EBlockStatus.WAITING;
  private transactions: Transaction[] = [];

  constructor(public blockValue: number) {
    this.tag = blockValue.toString(16);
  }

  public async save() {
    await this.downloadInfo();

    // second attempt if too early to refetching
    if (this.status === EBlockStatus.FAILED_FETCHING) {
      await delay();
      await this.downloadInfo();
    }

    // no third attempt
    if (this.status === EBlockStatus.FAILED_FETCHING) {
      throw new Error("Something wrong with block fetching");
    }

    await this.recordTransactions();
  }

  private async downloadInfo(): Promise<void> {
    const { data } = await axios(`https://api.etherscan.io/api`, {
      params: {
        module: "proxy",
        action: "eth_getBlockByNumber",
        tag: this.tag,
        boolean: true,
        apikey: process.env.API_KEY,
      },
    });

    if (!isPositiveBlockData(data)) {
      this.status = EBlockStatus.FAILED_FETCHING;
      return;
    }
    this.status = EBlockStatus.DOWNLOADED;
    this.transactions = data.result.transactions;
  }

  private async recordTransactions(): Promise<void> {
    // FIXME: maybe save transactions of pack of blocks is much better
    const previousRecord = await EtherTransaction.findOne({
      where: {
        block: this.blockValue,
      },
    });

    // prevent to save the same block twice
    if (!previousRecord) {
      await EtherTransaction.bulkCreate(
        this.transactions
          .filter((transaction) => parseInt(transaction.value, 16) !== 0)
          .map((transaction) => ({
            block: this.blockValue,
            sender: transaction.from,
            recipient: transaction.to,
            value: parseInt(transaction.value, 16),
          }))
      );
      console.log(`Block ${this.blockValue} info has been saved`);
    }

    this.status = EBlockStatus.SAVED;
  }
}
