"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("./message");
const database_1 = require("firebase-admin/database");
const storage_1 = require("firebase-admin/storage");
const uuid_1 = require("uuid");
const db = (0, database_1.getDatabase)();
const storage = (0, storage_1.getStorage)();
var ImageType;
(function (ImageType) {
    ImageType[ImageType["Photograph"] = 0] = "Photograph";
    ImageType[ImageType["Painting"] = 1] = "Painting";
})(ImageType || (ImageType = {}));
// create post details
function createPost(postDetails, userId) {
    const postId = (0, uuid_1.v4)();
    const postRef = db.ref(`posts/${postId}`);
    postRef.set({
        id: postId,
        title: postDetails.title,
        caption: postDetails.caption,
        latitude: postDetails.latitude,
        longitude: postDetails.longitude,
        likedBy: [userId],
        createdBy: userId,
        createdDate: Date.now(),
        lastUpdatedDate: Date.now()
    });
}
// upload associated image
function uploadPostImage(postId, imageData, userId, imageType) {
    return __awaiter(this, void 0, void 0, function* () {
        const bucket = storage.bucket('images');
        const name = `${postId}/${imageType.toString().toLowerCase()}.png`;
        const file = bucket.file(name);
        yield file.save(imageData, { public: true });
    });
}
// report content
function reportPost(postId, userId) {
    const blockedPosts = db.ref(`users/${userId}/blockedPosts`);
    blockedPosts.push(postId);
    (0, message_1.sendSms)(postId);
}
// like post
function likePost(postId, userId) {
    const likedPosts = db.ref(`users/${userId}/likedPosts`);
    const postLikes = db.ref(`posts/${postId}/likedBy`);
    likedPosts.push(postId);
    postLikes.push(userId);
}
// get all posts
function getPosts() {
    return __awaiter(this, void 0, void 0, function* () {
        const posts = db.ref(`posts`);
        const postResult = yield posts.once('value');
        if (postResult) {
            return postResult;
        }
        else {
            return [];
        }
    });
}
// get info about a specific post
function getPostDetails(postId) {
    const posts = db.ref(`posts/${postId}`);
    return posts.once('value');
}
