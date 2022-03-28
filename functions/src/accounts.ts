import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
const db = getDatabase();

// create post details
function createUser(userDisplayName: string, userId: string) {
    const postRef = db.ref(`users/${userId}`);
    const internalId = uuidv4()
    postRef.set({
        internalId,
        userId,
        displayName: userDisplayName,
        blockedPosts: [],
        createdDate: Date.now(),
        lastUpdatedDate: Date.now()
    });
}

// create post details
function getUser(userId: string) {
    const users = db.ref(`users/${userId}`);
    return users.once('value');
}
