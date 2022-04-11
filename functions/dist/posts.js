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
exports.getPostDetails = exports.getPosts = exports.unlikePost = exports.likePost = exports.deletePost = exports.reportPost = exports.uploadPostImage = exports.createPost = exports.ImageType = void 0;
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
// create post details - returns whether written
function createPost(postDetails, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const postId = (0, uuid_1.v4)();
        const postRef = db.collection('posts').doc(postId);
        const userRef = db.collection('users').doc(userId);
        try {
            yield db.runTransaction((t) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                const user = yield t.get(userRef);
                const userData = user.data();
                yield t.set(postRef, {
                    id: postId,
                    title: postDetails.title,
                    caption: (_b = postDetails.caption) !== null && _b !== void 0 ? _b : null,
                    latitude: postDetails.latitude,
                    longitude: postDetails.longitude,
                    likedBy: [userId],
                    createdBy: userId,
                    createdByDisplayName: userData.displayName,
                    createdDate: Date.now(),
                    lastUpdatedDate: Date.now(),
                    active: true
                });
                yield t.update(userRef, {
                    likedPosts: firestore_1.FieldValue.arrayUnion(postId),
                    createdPosts: firestore_1.FieldValue.arrayUnion(postId),
                    lastUpdatedDate: Date.now()
                });
            }));
        }
        catch (_a) {
            // do nothing (yet) - log?
        }
        return postId;
    });
}
exports.createPost = createPost;
// upload associated image
function uploadPostImage(postId, imageData, imageType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postRef = db.collection('posts').doc(postId);
            const bucket = storage.bucket(utils_1.storageBucket);
            const name = `${postId}-${imageType}.jpg`;
            const file = bucket.file(name);
            const options = { public: true, resumable: false, metadata: { contentType: "image/jpg" } };
            // upload file, then update the url pointing to it
            yield file.save(imageData, options);
            if (imageType === ImageType.Painting) {
                yield postRef.update({
                    paintingUrl: file.metadata.mediaLink
                });
            }
            else if (imageType === ImageType.Photograph) {
                yield postRef.update({
                    photographUrl: file.metadata.mediaLink
                });
            }
        }
        catch (err) {
            // do nothing (yet) - log?
        }
        return true;
    });
}
exports.uploadPostImage = uploadPostImage;
// report content
function reportPost(postId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userRef = db.collection('users').doc(userId);
        try {
            yield Promise.all([
                userRef.update({ blockedPosts: firestore_1.FieldValue.arrayUnion(postId) }),
                (0, utils_1.sendSms)(postId)
            ]);
        }
        catch (_a) {
            // do nothing (yet) - log?
        }
        return true;
    });
}
exports.reportPost = reportPost;
// delete a post
function deletePost(postId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userRef = db.collection('users').doc(userId);
        const postRef = db.collection('posts').doc(postId);
        try {
            yield db.runTransaction((t) => __awaiter(this, void 0, void 0, function* () {
                const post = yield t.get(postRef);
                if (post && post.exists) {
                    const postData = post.data();
                    if (postData.createdBy === userId) {
                        // tombstone the post
                        yield t.update(userRef, {
                            likedPosts: firestore_1.FieldValue.arrayRemove(postId),
                            createdPosts: firestore_1.FieldValue.arrayRemove(postId)
                        });
                        yield t.update(postRef, { active: false });
                    }
                }
            }));
        }
        catch (_a) {
            // do nothing (yet) - log?
        }
        return true;
    });
}
exports.deletePost = deletePost;
// like post
function likePost(postId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userRef = db.collection('users').doc(userId);
        const postRef = db.collection('posts').doc(postId);
        try {
            yield db.runTransaction((t) => __awaiter(this, void 0, void 0, function* () {
                yield t.update(postRef, { likedBy: firestore_1.FieldValue.arrayUnion(userId) });
                yield t.update(userRef, { likedPosts: firestore_1.FieldValue.arrayUnion(postId) });
            }));
        }
        catch (_a) {
            // do nothing (yet) - log?
        }
        return true;
    });
}
exports.likePost = likePost;
// unlike post
function unlikePost(postId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const userRef = db.collection('users').doc(userId);
        const postRef = db.collection('posts').doc(postId);
        try {
            yield db.runTransaction((t) => __awaiter(this, void 0, void 0, function* () {
                yield t.update(postRef, { likedBy: firestore_1.FieldValue.arrayRemove(userId) });
                yield t.update(userRef, { likedPosts: firestore_1.FieldValue.arrayRemove(postId) });
            }));
        }
        catch (_a) {
            // do nothing (yet) - log?
        }
        return true;
    });
}
exports.unlikePost = unlikePost;
// get all posts
function getPosts() {
    return __awaiter(this, void 0, void 0, function* () {
        const posts = yield db.collection('posts').get();
        const result = [];
        if (!posts.empty) {
            posts.forEach(post => {
                if (post && post.data()) {
                    const data = post.data();
                    if (data.active) {
                        result.push(data);
                    }
                }
            });
        }
        return result;
    });
}
exports.getPosts = getPosts;
// get info about a specific post
function getPostDetails(postId) {
    return __awaiter(this, void 0, void 0, function* () {
        const post = yield db.collection('posts').doc(postId).get();
        if (post && post.data()) {
            const data = post.data();
            if (data.active) {
                return data;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    });
}
exports.getPostDetails = getPostDetails;
