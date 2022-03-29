"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.createUser = void 0;
const firestore_1 = require("firebase-admin/firestore");
const uuid_1 = require("uuid");
const utils_1 = require("./utils");
(0, utils_1.startFirebaseApp)();
const db = (0, firestore_1.getFirestore)();
// create post details
function createUser(userDisplayName, userId) {
    const postRef = db.collection('users').doc(userId);
    const internalId = (0, uuid_1.v4)();
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
exports.createUser = createUser;
// create post details
function getUser(userId) {
    return db.collection('users').doc(userId).get();
}
exports.getUser = getUser;
