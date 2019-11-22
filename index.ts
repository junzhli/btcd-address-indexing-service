import express from "express";
import router from "./routers";
import rabbitMQ from "./libs/rabbitmq";
import logger from "./libs/logger";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandlers";
import loggerHandler from "./middlewares/loggerHandler";
import Mongo from "./libs/mongo";
import Redis from "./libs/redis";

const app = express();
app.set("etag", "strong"); // use strong etag
app.use(loggerHandler);

/**
 * RabbitMQ
 */
const rq = new rabbitMQ();

/**
 * MongoDB
 */
const mg = new Mongo();

/**
 * Redis
 */
const rs = new Redis({
    port: 6379,
    host: "127.0.0.1"
});

/**
 * Bitcoin Common APIs setup
 */
const baseUri = "/btc";
app.use(baseUri, router(mg, rs, rq));

app.use(errorHandler);
app.use(notFoundHandler);

const server = app.listen(3000, () =>
    logger.info("Bitcoin index service listening on port 3000!")
);

export default server;
