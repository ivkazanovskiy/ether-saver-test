import { Sequelize } from "sequelize-typescript";
import { EtherTransaction } from "./models/etherTransaction.model.ts";
import sequelizeConfig from "./config/database.json";
import { Dialect } from "sequelize/types";

interface SequelizeConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: Dialect;
}

const config = (
  process.env.NODE_ENV === "production"
    ? sequelizeConfig.production
    : process.env.NODE_ENV === "test"
    ? sequelizeConfig.test
    : sequelizeConfig.development
) as SequelizeConfig;

export const sequelize = new Sequelize({
  ...config,
  logging: false,
  models: [EtherTransaction],
});
