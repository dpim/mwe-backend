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
exports.getUser = exports.createUser = void 0;
const firestore_1 = require("firebase-admin/firestore");
const uuid_1 = require("uuid");
const utils_1 = require("./utils");
(0, utils_1.startFirebaseApp)();
const db = (0, firestore_1.getFirestore)();
// create user details
function createUser(userDisplayName, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const postRef = db.collection('users').doc(userId);
        const internalId = (0, uuid_1.v4)();
        yield postRef.set({
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
    });
}
exports.createUser = createUser;
// fetch user details
function getUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield db.collection('users').doc(userId).get();
        if (user && user.data()) {
            return user.data();
        }
        else {
            return null;
        }
    });
}
exports.getUser = getUser;
