import { DataSource } from "typeorm";
import ormconfig from "./ormconfig";

const datasource = new DataSource(ormconfig);

export default datasource;