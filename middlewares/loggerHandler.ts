import express from "express";
import logger from "../libs/logger";

const loggerHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.info("Request handling: " + req.method + " " + req.url);
    next();
};

export default loggerHandler;
