import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { firebaseConfig } from './utils';

admin.initializeApp(firebaseConfig);
const db = getFirestore();

// create post details
export function createUser(userDisplayName: string, userId: string): Promise<any>{
    const postRef = db.collection('users').doc(userId);
    const internalId = uuidv4()
    return postRef.set({
        internalId,
        userId,
        displayName: userDisplayName,
        blockedPosts: [],
        likedPosts: [],
        createdDate: Date.now(),
        lastUpdatedDate: Date.now()
    });
}

// create post details
export function getUser(userId: string): Promise<any> {
    return db.collection('users').doc(userId).get();
}
