"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostDetails = exports.getPosts = exports.likePost = exports.reportPost = exports.uploadPostImage = exports.createPost = exports.ImageType = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const uuid_1 = require("uuid");
const utils_1 = require("./utils");
admin.initializeApp(utils_1.firebaseConfig);
const db = (0, firestore_1.getFirestore)();
const storage = (0, storage_1.getStorage)();
var ImageType;
(function (ImageType) {
    ImageType[ImageType["Photograph"] = 0] = "Photograph";
    ImageType[ImageType["Painting"] = 1] = "Painting";
})(ImageType = exports.ImageType || (exports.ImageType = {}));
// create post details
function createPost(postDetails, userId) {
    const postId = (0, uuid_1.v4)();
    const postRef = db.collection('posts').doc(postId);
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
    const userRef = db.collection('users').doc(userId);
    return Promise.all([
        userRef.update({ blockedPosts: firestore_1.FieldValue.arrayUnion(postId) }),
        (0, utils_1.sendSms)(postId)
    ]);
}
exports.reportPost = reportPost;
// like post
function likePost(postId, userId) {
    const userRef = db.collection('users').doc(userId);
    const postRef = db.collection('posts').doc(postId);
    return Promise.all([
        userRef.update({ likedPosts: firestore_1.FieldValue.arrayUnion(postId) }),
        postRef.update({ postLikes: firestore_1.FieldValue.arrayUnion(postId) }),
    ]);
}
exports.likePost = likePost;
// get all posts
function getPosts() {
    return db.collection('posts').get();
}
exports.getPosts = getPosts;
// get info about a specific post
function getPostDetails(postId) {
    return db.collection('posts').doc(postId).get();
}
exports.getPostDetails = getPostDetails;
