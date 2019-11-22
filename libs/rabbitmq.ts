import amqplib from "amqplib";
import { Task, IResponseMessageAll } from "./types/rabbitmq";
import logger from "./logger";
import UserDataListener from "./eventListener";

const EX_ACCOUNT_RET = "account_ret";
const QU_ACCOUNT_RET = "account_ret";
const QU_ACCOUNT_REQ = "account_req";

class RabbitMq {
    private chan: amqplib.Channel | null;
    constructor() {
        this.chan = null;

        // async operations start here
        (async () => {
            const conn = await amqplib.connect(
                "amqp://guest:guest@10.23.127.145:5672"
            );
            conn.on("error", err => {
                logger.error("Error occurred in connection with RabbitMQ");
                logger.log({
                    level: "error",
                    message: "",
                    error: err
                });
            });
            conn.on("close", () => {
                logger.warn("Connection with RabbitMQ closed");
            });
            this.chan = await conn.createChannel();
            /**
             * Receive message
             */
            await this.chan.assertExchange(EX_ACCOUNT_RET, "fanout", {
                durable: true,
                internal: false,
                autoDelete: false
            });
            await this.chan.assertQueue(QU_ACCOUNT_RET, {
                durable: false,
                autoDelete: false
            });
            await this.chan.bindQueue(QU_ACCOUNT_RET, EX_ACCOUNT_RET, "");
            /**
             * Push message
             */
            this.chan.assertQueue(QU_ACCOUNT_REQ, {
                exclusive: false,
                durable: false,
                autoDelete: false
            });
        })().catch((err: any) => {
            logger.error("Unable to initialize RabbitMQ class properly");
            logger.log({
                level: "error",
                message: "",
                error: err
            });
        });
    }

    consumeMessage(command: Task, event: UserDataListener) {
        if (this.chan === null) {
            throw new Error("RabbitMQ not initialized properly");
        }
        return this.chan.consume(
            EX_ACCOUNT_RET,
            message => {
                if (message === null) {
                    logger.warn(
                        `Get null from rabbitmq with params: command => ${command}`
                    );
                    return;
                }

                let response: IResponseMessageAll | null = null;
                try {
                    response = JSON.parse(
                        message.content.toString()
                    ) as IResponseMessageAll;
                } catch (error) {
                    logger.error(
                        `Failed to parse response from rabbitmq with params: command => ${command}`
                    );
                    logger.log({ level: "error", message: "", error });
                }
                if (response === null) {
                    logger.warn(`Response value is null`);
                    return;
                }

                if (response.command === command) {
                    const key = event.genKey(response.account, command);
                    event.emit(key, response);
                }
            },
            {
                noAck: true
            }
        );
    }

    publishMessage(payload: Buffer) {
        if (this.chan === null) {
            throw new Error("RabbitMQ not initialized properly");
        }
        return this.chan.sendToQueue(QU_ACCOUNT_REQ, payload);
    }
}

export default RabbitMq;
