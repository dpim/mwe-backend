import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import { startFirebaseApp, sendSms } from './utils';

startFirebaseApp();
const db = getFirestore();
const storage = getStorage();

export type PostInput = {
    title: string,
    caption?: string,
    latitude: number,
    longitude: number
}

export type Post = {
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

export enum ImageType {
    Photograph,
    Painting
}

// create post details
export function createPost(postDetails: PostInput, userId: string): Promise<any>{
    const postId = uuidv4();
    const postRef = db.collection('posts').doc(postId);
    return postRef.set({
        id: postId,
        title: postDetails.title,
        caption: postDetails.caption,
        latitude: postDetails.latitude,
        longitude: postDetails.longitude,
        likedBy: [ userId ],
        createdBy: userId,
        createdDate: Date.now(),
        lastUpdatedDate: Date.now()
    })
}

// upload associated image
export function uploadPostImage(postId: string, imageData: Buffer, userId: string, imageType: ImageType): Promise<any> {
    const bucket = storage.bucket('images');
    const name = `${postId}/${imageType.toString().toLowerCase()}.png`;
    const file = bucket.file(name);
    return file.save(imageData, { public: true});
}

// report content
export function reportPost(postId: string, userId: string): Promise<any> {
    const userRef = db.collection('users').doc(userId);
    return Promise.all([
        userRef.update({ blockedPosts: FieldValue.arrayUnion(postId) }),
        sendSms(postId)
    ]);
}

// like post
export function likePost(postId: string, userId: string): Promise<any> {
    const userRef = db.collection('users').doc(userId);
    const postRef = db.collection('posts').doc(postId);
    return Promise.all([
        userRef.update({ likedPosts: FieldValue.arrayUnion(postId) }),
        postRef.update({ postLikes: FieldValue.arrayUnion(postId) }),
    ]);
}

// get all posts
export function getPosts(): Promise<any> {
    return db.collection('posts').get();
}

// get info about a specific post
export function getPostDetails(postId: string): Promise<any> {
    return db.collection('posts').doc(postId).get();
}

