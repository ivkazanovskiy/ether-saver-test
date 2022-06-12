import { sequelize } from "./db/sequelize";
import { Saver } from "./Saver";
import * as dotenv from "dotenv";
dotenv.config();

const saver = new Saver();
sequelize.sync().then(() => saver.start());