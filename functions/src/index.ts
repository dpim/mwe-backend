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
app.use(express.json());
app.use(cors({ origin: true }));
app.use(express.urlencoded({extended: true}));

// account routes
app.get('/users/:id', async (request: Request<{id: string}>, response: Response) => {
   const userId = request.params.id;
   const user = await getUser(userId);
   return response.send(user);
});

app.post('/users/:id', async (request: Request<{id: string}>, response: Response) => {
   const userId = request.params.id;
   const userDisplayName = request.body.displayName;
   if (!userDisplayName){
      return response.sendStatus(400);
   }
   const user = await createUser(userDisplayName, userId);
   return response.send(user);
});

// post routes
app.get('/posts', async (request: Request, response: Response) => {
   const posts = await getPosts();
   return response.send(posts);
});

app.get('/posts/:id', async (request: Request<{id: string}>, response: Response) => {
   const post = await getPostDetails(request.params.id);
   return response.send(post);
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
   const postId = await createPost(postDetails, userId)
   return response.send({ postId });
});

app.post('/posts/:id/photo', multerMiddleware.single('file'), async (request: Request<{id: string}>, response: Response) => {
   const image = request.file?.buffer;
   const postId = request.params.id;
   const userId = request.body.userId;
   const type = ImageType.Photograph;
   if (image){
      await uploadPostImage(postId, image, userId, type);
      return response.sendStatus(201);
   } else {
      return response.sendStatus(400);
   }
});

app.post('/posts/:id/picture', multerMiddleware.single('file'), async (request: Request<{id: string}>, response: Response) => {
   const image = request.file?.buffer;
   const postId = request.params.id;
   const userId = request.body.userId;
   const type = ImageType.Painting;
   if (image){
      await uploadPostImage(postId, image, userId, type)
      return response.sendStatus(201);
   } else {
      return response.sendStatus(400);
   }
});

app.post('/posts/:id/like', async (request: Request<{id: string}>, response: Response) => {
   const userId = request.body.userId;
   const postId = request.params.id;
   await likePost(postId, userId);
   return response.sendStatus(201);
});

app.post('/posts/:id/report', async (request: Request<{id: string}>, response: Response) => {
   const userId = request.body.userId;
   const postId = request.params.id;
   await reportPost(postId, userId);
   return response.sendStatus(201);
});

exports.api = functions.https.onRequest(app);
