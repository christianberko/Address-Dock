import fs from 'fs';
import express, { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { ENV } from './constants/environment-vars.constants';

const router = express.Router();

// Using the * wildcard to match any route
//covers all GET, POST, PUT, and DELETE requests


router.get('*', (req: Request, res: Response, next: NextFunction) => {
    try {
        (require(getEndpointControllerPath(req))).getRoute(req, res, next);
    } catch (err) {
        next(err);
    }
});

router.post('*', (req: Request, res: Response, next: NextFunction) => {
    try {
        (require(getEndpointControllerPath(req))).postRoute(req, res, next);
    } catch (err) {
        next(err);
    }
});

router.put('*', (req: Request, res: Response, next: NextFunction) => {
    try {
        (require(getEndpointControllerPath(req))).putRoute(req, res, next);
    } catch (err) {
        next(err);
    }
});

router.delete('*', (req: Request, res: Response, next: NextFunction) => {
    try {
        (require(getEndpointControllerPath(req))).deleteRoute(req, res, next);
    } catch (err) {
        next(err);
    }
});

function getEndpointControllerPath(req: Request): string {
    // Extracting endpoint name from URL "/address/count" -> "address"
    const urlParts = req.baseUrl.split('/');
    const endpointName = urlParts[1];
    
    // Checking if endpoint name is missing/invalid
    if (!endpointName || endpointName === 'base') {
        throw new createHttpError.BadRequest();
    }
    
    // Build file path 
    const fileExtension = (ENV === 'dev') ? 'ts' : 'js';
    const filePath = `${__dirname}/endpoints/${endpointName}.endpoint.${fileExtension}`;
    
    // Checking if the endpoint file exists
    if (!fs.existsSync(filePath)) {
        throw new createHttpError.BadRequest();
    }
    
    
    return filePath;
}

export default router;