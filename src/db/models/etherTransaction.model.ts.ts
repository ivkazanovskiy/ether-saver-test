import { Table, Column, Model } from "sequelize-typescript";
import { BIGINT, DataTypes } from "sequelize";

@Table
export class EtherTransaction extends Model {
  @Column
  block: number;

  @Column
  sender: string;

  @Column
  recipient: string;

  @Column({ type: DataTypes.DECIMAL })
  value: number;
}
