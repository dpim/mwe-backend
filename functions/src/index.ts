import * as functions from 'firebase-functions'
import * as express from 'express'
import { Request, Response } from 'express'

exports.helloWorld = functions.https.onRequest((request: Request, response: Response) => {
   functions.logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
});
