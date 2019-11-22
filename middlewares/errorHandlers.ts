import * as httpStatus from "http-status-codes";
import express from "express";
import logger from "../libs/logger";

const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // operational/technical errors
    logger.log({ level: "error", message: "", error: err });
    const sentCode = httpStatus.INTERNAL_SERVER_ERROR;

    res.status(sentCode).send();
};

const notFoundHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(httpStatus.NOT_FOUND).end();
};

export {
    errorHandler,
    notFoundHandler
};
