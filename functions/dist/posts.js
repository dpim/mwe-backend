"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostDetails = exports.getPosts = exports.likePost = exports.reportPost = exports.uploadPostImage = exports.createPost = exports.ImageType = void 0;
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
})(ImageType = exports.ImageType || (exports.ImageType = {}));
// create post details
function createPost(postDetails, userId) {
    const postId = (0, uuid_1.v4)();
    const postRef = db.ref(`posts/${postId}`);
    return postRef.set({
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
exports.createPost = createPost;
// upload associated image
function uploadPostImage(postId, imageData, userId, imageType) {
    const bucket = storage.bucket('images');
    const name = `${postId}/${imageType.toString().toLowerCase()}.png`;
    const file = bucket.file(name);
    return file.save(imageData, { public: true });
}
exports.uploadPostImage = uploadPostImage;
// report content
function reportPost(postId, userId) {
    const blockedPosts = db.ref(`users/${userId}/blockedPosts`);
    return Promise.all([
        blockedPosts.push(postId),
        (0, message_1.sendSms)(postId)
    ]);
}
exports.reportPost = reportPost;
// like post
function likePost(postId, userId) {
    const likedPosts = db.ref(`users/${userId}/likedPosts`);
    const postLikes = db.ref(`posts/${postId}/likedBy`);
    return Promise.all([
        likedPosts.push(postId),
        postLikes.push(userId)
    ]);
}
exports.likePost = likePost;
// get all posts
function getPosts() {
    const posts = db.ref(`posts`);
    return posts.once('value');
}
exports.getPosts = getPosts;
// get info about a specific post
function getPostDetails(postId) {
    const posts = db.ref(`posts/${postId}`);
    return posts.once('value');
}
exports.getPostDetails = getPostDetails;
