import express from "express";
import httpStatus from "http-status-codes";
import RabbitMq from "../libs/rabbitmq";
import {
    IRequestMessage,
    Command,
    Task,
    IResponseMessageAll
} from "../libs/types/rabbitmq";
import logger from "../libs/logger";
import UserDataListener from "../libs/eventListener";
import Mongo from "../libs/mongo";
import Redis from "../libs/redis";
import {
    StateNew,
    ProcessState,
    StateAlreadyExisting
} from "../libs/types/redis";
import { IResponseError } from "./types";

let mongo: Mongo;
let rabbitmq: RabbitMq;
let redis: Redis;
let responseListener: UserDataListener;
const timeout = 30000;

const MESSAGES_RECEIVED =
    "Your request has been received. Please get back to try again later";

const genPayload = (cmd: Task, addr: string) => {
    const payload: IRequestMessage = {
        task: cmd,
        account: addr
    };
    return Buffer.from(JSON.stringify(payload));
};

const prepareResponse = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    dataFactory: (response: IResponseMessageAll) => any
) => {
    const address = req.params.addr;
    const key = responseListener.genKey(address, Command.All);

    let state: ProcessState | null = (await redis.getPromisify(
        key
    )) as ProcessState;
    let newState: ProcessState | null = null;
    let needDispatch: boolean = true;
    let isNew: boolean | null = null;
    if (state === null) {
        isNew = await mongo.checkUserIsNew(address);
        newState = isNew ? StateNew : StateAlreadyExisting;
        const success = await redis.setnxPromisify(
            key,
            newState
        );

        if (!success) {
            state = (await redis.getPromisify(key)) as ProcessState;
        }
    }

    if (state !== null) {
        switch (state) {
            case StateNew:
                res.status(httpStatus.CREATED).send({
                    message: MESSAGES_RECEIVED
                } as IResponseError);
                return;
            case StateAlreadyExisting:
                needDispatch = false;
                break;
            default:
                throw new Error("Unsupported state");
        }
    }

    let timer: NodeJS.Timeout;
    timer = setTimeout(() => {
        responseListener.removeListener(key, cb);
        const err = new Error("Time limit exceeded");
        next(err);
    }, timeout);
    const cb = (response: IResponseMessageAll) => {
        const result = dataFactory(response);
        res.send(result);
        clearTimeout(timer);
    };

    if (needDispatch) {
        const payload = genPayload(Command.All, address);
        rabbitmq.publishMessage(payload);
    }
    responseListener.once(key, cb);
};

const getAddressTransactions = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        await prepareResponse(req, res, next, response => {
            return response.data.transactions;
        });
    } catch (error) {
        next(error);
    }
};

const getAddressBalance = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        await prepareResponse(req, res, next, response => {
            return {
                balance: response.data.balance
            };
        });
    } catch (error) {
        next(error);
    }
};

const getAddressUTXOs = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        await prepareResponse(req, res, next, response => {
            return response.data.unspents;
        });
    } catch (error) {
        next(error);
    }
};

export default (mg: Mongo, rs: Redis, rq: RabbitMq) => {
    mongo = mg;
    redis = rs;
    rabbitmq = rq;
    responseListener = new UserDataListener();

    setTimeout(() => {
        rabbitmq
            .consumeMessage(Command.All, responseListener)
            .then(() => logger.debug("Consumer channel created"))
            .catch((err: Error) => {
                logger.error(
                    "Error occurred on creating consumer channel for response message"
                );
                logger.log({
                    level: "error",
                    message: "",
                    error: err
                });
            });
    }, 3000); // Sleep 3s for RabbitMQ connection initialization

    return {
        getAddressTransactions,
        getAddressBalance,
        getAddressUTXOs
    };
};
