import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const ormconfig: PostgresConnectionOptions = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "tinhban123",
    database: "blog",
    entities: [__dirname + "/**/*.entity{.ts,.js}"],
    synchronize: false,
    migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
}
export default ormconfig;