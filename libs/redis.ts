import { RedisClient, ClientOpts } from "redis";
import logger from "./logger";

class Redis extends RedisClient {
    constructor(options: ClientOpts) {
        super(options);
        this.on("connect", () => {
            logger.info("Redis connected");
        });
        this.on("error", err => {
            logger.error("Error occurred in connection with Redis");
            logger.log({
                level: "error",
                message: "",
                error: err
            });
        });
    }

    getPromisify(key: string) {
        const error = new Error("Failed to get key's value: " + key);
        return new Promise<string>((res, rej) => {
            const success = this.get(key, (err, value) => {
                if (err) {
                    rej(error);
                }

                res(value);
            });

            if (!success) {
                rej(error);
            }
        });
    }

    setnxPromisify(key: string, value: string) {
        const error = new Error(
            "Error occurred when trying to set key with value: key => " +
                key +
                " value => " +
                value
        );
        return new Promise<number>((res, rej) => {
            const success = this.setnx(key, value, (err, value) => {
                if (err) {
                    rej(error);
                }

                res(value);
            });

            if (!success) {
                rej(error);
            }
        });
    }
}

export default Redis;
