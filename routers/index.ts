import express from "express";
import * as bodyParser from "body-parser";
import Controller from "../controllers";
import RabbitMq from "../libs/rabbitmq";
import Mongo from "../libs/mongo";
import Redis from "../libs/redis";

export default (mg: Mongo, rs: Redis, rq: RabbitMq) => {
    const controller = Controller(mg, rs, rq);
    const router = express.Router();

    router.use(bodyParser.json());

    // get transactions for a specific address
    router.get("/addr/:addr/tx", controller.getAddressTransactions);

    // get balance for a specific address
    router.get("/addr/:addr/balance", controller.getAddressBalance);

    // get utxo set for a specific address
    router.get("/addr/:addr/utxo", controller.getAddressUTXOs);

    return router;
};
