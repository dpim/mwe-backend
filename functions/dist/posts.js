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
exports.getPostDetails = exports.getPosts = exports.likePost = exports.reportPost = exports.uploadPostImage = exports.createPost = exports.ImageType = void 0;
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const uuid_1 = require("uuid");
const utils_1 = require("./utils");
(0, utils_1.startFirebaseApp)();
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
    return __awaiter(this, void 0, void 0, function* () {
        const posts = yield db.collection('posts').get();
        const result = [];
        if (!posts.empty) {
            posts.forEach(post => {
                result.push(post.data());
            });
        }
        return result;
    });
}
exports.getPosts = getPosts;
// get info about a specific post
function getPostDetails(postId) {
    return __awaiter(this, void 0, void 0, function* () {
        return db.collection('posts').doc(postId).get();
    });
}
exports.getPostDetails = getPostDetails;
