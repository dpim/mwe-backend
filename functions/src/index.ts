import * as functions from 'firebase-functions'
import { Request, Response } from 'express'
import express from 'express';
import cors from 'cors';
import passport from 'passport';

import * as User from './users';
import * as Post from './posts';
import * as Auth from './auth';

passport.use(Auth.jwtStrategy);
const jwtMiddleware =  passport.authenticate('jwt', { session: false });

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// get JWT from id token
app.post('/token', async (request: Request<{ id: string }>, response: Response) => {
   const token = await Auth.createToken(request.params.id);
   return response.send(token);
});

// get JWT from id token
app.post('/token/renew', async (request: Request<{ token: string }>, response: Response) => {
   const token = await Auth.renewToken(request.params.token);
   if (token) {
      return response.send(token);
   }
   return response.sendStatus(400);
});

// account routes
app.get('/users/:id', async (request: Request<{ id: string }>, response: Response) => {
   const requestUser: any = request.user;
   const userId = requestUser.id;
   const user = await User.getUser(userId);
   return response.send(user);
});

app.post('/users/:id', jwtMiddleware, async (request: Request<{ id: string }>, response: Response) => {
   const requestUser: any = request.user;
   const userId = requestUser.id;
   const userDisplayName = request.body.displayName;
   if (!userDisplayName) {
      return response.sendStatus(400);
   }
   const user = await User.createUser(userDisplayName, userId);
   return response.send(user);
});

// post routes
app.get('/posts', async (request: Request, response: Response) => {
   const posts = await Post.getPosts();
   return response.send(posts);
});

app.get('/posts/:id', async (request: Request<{ id: string }>, response: Response) => {
   const post = await Post.getPostDetails(request.params.id);
   return response.send(post);
});

app.post('/posts', jwtMiddleware, async (request: Request, response: Response) => {
   const body = request.body;
   const requestUser: any = request.user;
   const userId = requestUser.id;
   const postDetails: Post.PostInput = {
      title: body.title,
      caption: body.caption ?? null,
      latitude: body.latitude,
      longitude: body.longitude
   };
   const postId = await Post.createPost(postDetails, userId)
   return response.send({ postId });
});

app.post('/posts/:id/upload/:type', jwtMiddleware, async (request: Request<{ id: string, type: string }>, response: Response) => {
   const postId = request.params.id;
   const typeString = request.params.type;
   const type = (typeString === "picture") ? Post.ImageType.Painting : Post.ImageType.Photograph;
   const imageString = request.body.image;
   try {
      if (imageString) {
         const base64EncodedImageString = imageString.replace(/^data:image\/\w+;base64,/, '');
         const buffer = Buffer.from(base64EncodedImageString, 'base64');
         await Post.uploadPostImage(postId, buffer, type);
         return response.sendStatus(201);
      } else {
         return response.sendStatus(400);
      }
   } catch {
      return response.sendStatus(500);
   }
});

app.post('/posts/:id/like', jwtMiddleware, async (request: Request<{ id: string }>, response: Response) => {
   const requestUser: any = request.user;
   const userId = requestUser.id;
   const postId = request.params.id;
   await Post.likePost(postId, userId);
   return response.sendStatus(201);
});

app.post('/posts/:id/unlike', jwtMiddleware, async (request: Request<{ id: string }>, response: Response) => {
   const requestUser: any = request.user;
   const userId = requestUser.id;
   const postId = request.params.id;
   await Post.unlikePost(postId, userId);
   return response.sendStatus(201);
});

app.post('/posts/:id/report', async (request: Request<{ id: string }>, response: Response) => {
   const requestUser: any = request.user;
   const userId = requestUser.id;
   const postId = request.params.id;
   await Post.reportPost(postId, userId);
   return response.sendStatus(201);
});

app.post('/posts/:id/delete', jwtMiddleware, async (request: Request<{ id: string }>, response: Response) => {
   const requestUser: any = request.user;
   const userId = requestUser.id;
   const postId = request.params.id;
   await Post.deletePost(postId, userId);
   return response.sendStatus(201);
});

exports.api = functions.https.onRequest(app);
