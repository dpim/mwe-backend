import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import stream from 'stream';
import { startFirebaseApp, sendSms, storageBucket } from './utils';

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
    likedBy: [string],
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

// create post details - returns whether written
export async function createPost(postDetails: PostInput, userId: string): Promise<string> {
    const postId = uuidv4();
    const postRef = db.collection('posts').doc(postId);
    const userRef = db.collection('users').doc(userId);
    try {
        await db.runTransaction(async (t) => {
            await t.set(postRef, {
                id: postId,
                title: postDetails.title,
                caption: postDetails.caption ?? null,
                latitude: postDetails.latitude,
                longitude: postDetails.longitude,
                likedBy: [userId],
                createdBy: userId,
                createdDate: Date.now(),
                lastUpdatedDate: Date.now()
            });
            await t.update(userRef, {
                likedPosts: FieldValue.arrayUnion(postId),
                createdPosts: FieldValue.arrayUnion(postId),
                lastUpdatedDate: Date.now()
            });
        });
    } catch {
        // do nothing (yet) - log?
    }
    return postId;
}

// upload associated image
export async function uploadPostImage(postId: string, imageData: Buffer, imageType: ImageType): Promise<any> {
    try {
        const postRef = db.collection('posts').doc(postId);
        const bucket = storage.bucket(storageBucket);
        const name = `${postId}-${imageType}.jpg`;
        const file = bucket.file(name);
        const options = { public: true, resumable: false, metadata: { contentType: "image/jpg" } }
        // upload file, then update the url pointing to it
        await file.save(imageData, options);
        if (imageType === ImageType.Painting) {
            await postRef.update({
                paintingUrl: file.metadata.mediaLink
            });
        } else if (imageType === ImageType.Photograph) {
            await postRef.update({
                photographUrl: file.metadata.mediaLink
            });
        }
    } catch (err) {
        // do nothing (yet) - log?
    }
    return true;
}

// report content
export async function reportPost(postId: string, userId: string): Promise<boolean> {
    const userRef = db.collection('users').doc(userId);
    try {
        await Promise.all([
            userRef.update({ blockedPosts: FieldValue.arrayUnion(postId) }),
            sendSms(postId)
        ]);
    } catch {
        // do nothing (yet) - log?
    }
    return true;
}

// like post
export async function likePost(postId: string, userId: string): Promise<boolean> {
    const userRef = db.collection('users').doc(userId);
    const postRef = db.collection('posts').doc(postId);
    try {
        await db.runTransaction(async (t) => {
            t.update(postRef, { likedBy: FieldValue.arrayUnion(userId) });
            t.update(userRef, { likedPosts: FieldValue.arrayUnion(postId) });
        });
    } catch {
        // do nothing (yet) - log?
    }
    return true;
}

// unlike post
export async function unlikePost(postId: string, userId: string): Promise<boolean> {
    const userRef = db.collection('users').doc(userId);
    const postRef = db.collection('posts').doc(postId);
    try {
        await db.runTransaction(async (t) => {
            t.update(postRef, { likedBy: FieldValue.arrayRemove(userId) });
            t.update(userRef, { likedPosts: FieldValue.arrayRemove(postId) });
        });
    } catch {
        // do nothing (yet) - log?
    }
    return true;
}

// get all posts
export async function getPosts(): Promise<any> {
    const posts = await db.collection('posts').get();
    const result: any[] = [];
    if (!posts.empty) {
        posts.forEach(post => {
            result.push(post.data());
        });
    }
    return result;
}

// get info about a specific post
export async function getPostDetails(postId: string): Promise<any> {
    const post = await db.collection('posts').doc(postId).get();
    if (post && post.data()) {
        return post.data();
    } else {
        return null;
    }
}

