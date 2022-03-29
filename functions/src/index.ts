import * as functions from 'firebase-functions'
import multer from 'multer';
import { Request, Response } from 'express'
import express from 'express';
import cors from 'cors';
import { createUser, getUser } from './users';
import { PostInput, getPostDetails, getPosts, likePost, reportPost, createPost, uploadPostImage, ImageType } from './posts';

const multerMiddleware = multer({
   storage: multer.memoryStorage(),
   limits: {
     fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
   }
 });

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
   const body = request.body;
   const userId = request.body.userId;
   const postDetails: PostInput = {
      title: body.title,
      caption: body.caption,
      latitude: body.latitude,
      longitude: body.longitude
   };
   const post = await createPost(postDetails, userId)
   response.send(post)
});

app.post('/posts/:id/photo', multerMiddleware.single('file'), async (request: Request<{id: string}>, response: Response) => {
   const image = request.file?.buffer;
   const postId = request.params.id;
   const userId = request.body.userId;
   const type = ImageType.Photograph;
   if (image){
      await uploadPostImage(postId, image, userId, type);
      response.sendStatus(201);
   } else {
      response.sendStatus(400);
   }
});

app.post('/posts/:id/picture', multerMiddleware.single('file'), async (request: Request<{id: string}>, response: Response) => {
   const image = request.file?.buffer;
   const postId = request.params.id;
   const userId = request.body.userId;
   const type = ImageType.Painting;
   if (image){
      await uploadPostImage(postId, image, userId, type)
      response.sendStatus(201);
   } else {
      response.sendStatus(400);
   }
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
