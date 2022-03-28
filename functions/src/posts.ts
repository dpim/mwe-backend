import { sendSms } from './message';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
const db = getDatabase();
const storage = getStorage();

type PostInput = {
    title: string,
    caption?: string,
    latitude: number,
    longitude: number
}

type Post = {
    title: string,
    caption?: string,
    latitude: number,
    longitude: number,
    likedBy: [ string ],
    createdBy: string,
    createdDate: Date,
    lastUpdatedDate: Date,
    id: string,
    photographUrl?: string,
    paintingUrl?: string,
}

enum ImageType {
    Photograph,
    Painting
}

// create post details
export function createPost(postDetails: PostInput, userId: string) {
    const postId = uuidv4();
    const postRef = db.ref(`posts/${postId}`);
    postRef.set({
        id: postId,
        title: postDetails.title,
        caption: postDetails.caption,
        latitude: postDetails.latitude,
        longitude: postDetails.longitude,
        likedBy: [ userId ],
        createdBy: userId,
        createdDate: Date.now(),
        lastUpdatedDate: Date.now()
    });
}

// upload associated image
export function uploadPostImage(postId: string, imageData: Buffer, userId: string, imageType: ImageType){
    const bucket = storage.bucket('images');
    const name = `${postId}/${imageType.toString().toLowerCase()}.png`;
    const file = bucket.file(name);
    return file.save(imageData, { public: true});
}

// report content
export function reportPost(postId: string, userId: string){
    const blockedPosts = db.ref(`users/${userId}/blockedPosts`);
    return Promise.all([
        blockedPosts.push(postId),
        sendSms(postId)
    ]);
}

// like post
export function likePost(postId: string, userId: string){
    const likedPosts = db.ref(`users/${userId}/likedPosts`);
    const postLikes = db.ref(`posts/${postId}/likedBy`);
    return Promise.all([
        likedPosts.push(postId),
        postLikes.push(userId)
    ]);
}

// get all posts
export function getPosts(){
    const posts = db.ref(`posts`);
    return  posts.once('value');
}

// get info about a specific post
export function getPostDetails(postId: string){
    const posts = db.ref(`posts/${postId}`);
    return posts.once('value');
}

