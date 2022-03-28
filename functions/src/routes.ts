import * as functions from 'firebase-functions'
import { Request, Response } from 'express'
import express from 'express';
import cors from 'cors';
import { createUser, getUser } from './users';
import { getPostDetails, getPosts, likePost, reportPost } from './posts';

const app = express();
app.use(cors({ origin: true }));

// exports.helloWorld = functions.https.onRequest((request: Request, response: Response) => {
//    functions.logger.info("Hello logs!", {structuredData: true});
//    response.send("Hello from Firebase!");
// });

// account routes
app.get('/users/:id', async (request: Request<{id: string}>, response: Response) => {
   const userId = request.params.id;
   const user = await getUser(userId);
   response.send(user);
});

app.post('/users/:id', async (request: Request<{id: string}>, response: Response) => {
   const userId = request.params.id;
   const userDisplayName = request.body.displayName;
   if (!userDisplayName){
      response.sendStatus(400);
   }
   const user = await createUser(userDisplayName, userId);
   response.send(user);
});

// post routes
app.get('/posts', async (request: Request, response: Response) => {
   const posts = await getPosts();
   response.send(posts);
});

app.get('/posts/:id', async (request: Request<{id: string}>, response: Response) => {
   const post = await getPostDetails(request.params.id);
   response.send(post);
});

app.post('/posts', async (request: Request, response: Response) => {
   // TBD
});

app.post('/posts/:id/photo', async (request: Request<{id: string}>, response: Response) => {
   // TBD
});

app.post('/posts/:id/picture', async (request: Request<{id: string}>, response: Response) => {
   // TBD
});

app.post('/posts/:id/like', async (request: Request<{id: string}>, response: Response) => {
   const userId = request.body.userId;
   const postId = request.params.id;
   await likePost(postId, userId);
   response.sendStatus(201);
});

app.post('/posts/:id/report', async (request: Request<{id: string}>, response: Response) => {
   const userId = request.body.userId;
   const postId = request.params.id;
   await reportPost(postId, userId);
   response.sendStatus(201);
});

exports.api = functions.https.onRequest(app);
