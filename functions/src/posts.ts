import { sendSms } from './message';
import { getDatabase } from 'firebase-admin/database';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from 'firebase-admin';
const db = getDatabase();

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
function createPost(postDetails: PostInput, userId: string) {
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
function uploadPostImage(postId: string, imageData: Blob, userId: string, imageType: ImageType){
    // do something
}

// report content
function reportPost(postId: string, userId: string){
    const blockedPosts = db.ref(`users/${userId}/blockedPosts`);
    blockedPosts.push(postId);
    sendSms(postId);
}

// like post
function likePost(postId: string, userId: string){
    const likedPosts = db.ref(`users/${userId}/likedPosts`);
    const postLikes = db.ref(`posts/${postId}/likedBy`);
    likedPosts.push(postId);
    postLikes.push(userId);
}

// get all posts
async function getPosts(){
    const posts = db.ref(`posts`);
    const postResult = await posts.once('value');
    if (postResult){
        return postResult
    } else {
        return []
    }
}

// get info about a specific post
async function getPostDetails(postId: string){
    const posts = db.ref(`posts/${postId}`);
    const postResult = await posts.once('value');
    if (postResult){
        return postResult
    } else {
        return null
    }
}

