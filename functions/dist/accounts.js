"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("firebase-admin/database");
const uuid_1 = require("uuid");
const db = (0, database_1.getDatabase)();
// create post details
function createUser(userDisplayName, userId) {
    const postRef = db.ref(`users/${userId}`);
    const internalId = (0, uuid_1.v4)();
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
function getUser(userId) {
    const users = db.ref(`users/${userId}`);
    return users.once('value');
}
