import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { startFirebaseApp } from './utils';

startFirebaseApp();
const db = getFirestore();

// create user details
export async function createUser(userDisplayName: string, userId: string): Promise<any>{
    const postRef = db.collection('users').doc(userId);
    const internalId = uuidv4()
    await postRef.set({
        internalId,
        userId,
        displayName: userDisplayName,
        blockedPosts: [],
        likedPosts: [],
        createdPosts: [],
        createdDate: Date.now(),
        lastUpdatedDate: Date.now()
    });
    return userId;
}

// fetch user details
export async function getUser(userId: string): Promise<any> {
    const user = await db.collection('users').doc(userId).get();
    if (user && user.data()){
        return user.data();
    } else {
        return null;
    }
}
