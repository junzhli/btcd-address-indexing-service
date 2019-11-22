import logger from "../libs/logger";
import { MongoClient, Db } from "mongodb";

// const info = {
//     user: process.env.MONGODB_USER || '',
//     password: process.env.MONGODB_PASSWORD || '',
//     ip_port: process.env.MONGODB_HOSTS || '',
//     replica_name: process.env.MONGODB_REPLICA_NAME || '',
//     dbname: 'bitcoins'
// };

// const getConnectionInfo = () => {
//     if (info.ip_port === '') {
//         logger.error('MongoDB Hosts not set properly. Shuting down!');
//         process.exit(0);
//     }

//     if (info.replica_name === '') {
//         if (info.user === '' && info.password === '') {
//             logger.warn('MongoDB username and password not existing');
//             return 'mongodb://' + info.ip_port + '/' + info.dbname;
//         } else {
//             return 'mongodb://' + info.user + ':' + info.password + '@' + info.ip_port + '/' + info.dbname;
//         }
//     } else {
//         logger.verbose('MongoDB replica name setting enabled!');
//         if (info.user === '' && info.password === '') {
//             logger.warn('MongoDB username and password not existing');
//             return 'mongodb://' + info.ip_port + '/' + info.dbname + '?replicaSet=' + info.replica_name;
//         } else {
//             return 'mongodb://' + info.user + ':' + info.password + '@' + info.ip_port + '/' + info.dbname + '?replicaSet=' + info.replica_name;
//         }
//     }
// };

class Mongo {
    client?: Db;
    private dbName: string;
    private collUser: string;

    constructor() {
        this.dbName = "bitcoinindex";
        this.collUser = "users";
        logger.debug("MongoHelper created");
        MongoClient.connect("mongodb://127.0.0.1/bitcoinindex", {
            useNewUrlParser: true,
            poolSize: 10,
            reconnectTries: Number.MAX_VALUE
        }).then(
            client => {
                this.client = client.db(this.dbName);

                this.client.on("connected", () => {
                    logger.info("MongoHelper connected successfully");
                });
                this.client.on("error", error => {
                    logger.error("MongoHelper error has occurred");
                    logger.log({
                        level: "error",
                        message: "",
                        error
                    });
                });
                this.client.on("disconnected", () => {
                    logger.warn("MongoHelper disconnected");
                });
                this.client.on("reconnect", () => {
                    logger.warn("MongoHelper reconnect...");
                });

                logger.verbose("MongoHelper init connection succeed");
            },
            error => {
                logger.error("MongoHelper init connection failed");
                logger.log({
                    level: "error",
                    message: "",
                    error
                });
                return new Error("MongoHelper Init connection failed");
            }
        );
    }

    async checkUserIsNew(addr: string) {
        if (!this.client) {
            throw new Error("MongoHelper not init properly");
        }

        const count = await this.client.collection(this.collUser).count({
            address: addr
        });

        return count === 0 ? true : false;
    }
}

export default Mongo;
