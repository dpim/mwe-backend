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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const sinon = __importStar(require("sinon"));
const assert = __importStar(require("assert"));
const post = __importStar(require("../posts"));
const utils_1 = require("./utils");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
const test = (0, firebase_functions_test_1.default)({
    projectId: utils_1.projectId
});
const mockPostData = {
    title: "test post",
    latitude: 123.456,
    longitude: -78.9
};
const mockUserId = "user_123";
const secondMockUserId = "user_456";
before(() => {
    sinon.stub(firebase_admin_1.default, 'initializeApp');
});
after(() => test.cleanup());
describe("empty state", () => __awaiter(void 0, void 0, void 0, function* () {
    it("should fetch empty posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield post.getPosts();
        assert.deepEqual(result, []);
    }));
    it("should fetch empty specific post", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield post.getPostDetails("123");
        assert.equal(result, null);
    }));
}));
describe("post creation", () => __awaiter(void 0, void 0, void 0, function* () {
    it("should create new post", () => __awaiter(void 0, void 0, void 0, function* () {
        const postId = yield post.createPost(mockPostData, mockUserId);
        assert.notEqual(postId, null);
        const result = yield post.getPostDetails(postId);
        assert.equal(result.id, postId);
        assert.equal(result.title, mockPostData.title);
        assert.equal(result.createdBy, mockUserId);
        assert.equal(result.caption, mockPostData.caption);
        assert.equal(result.latitude, mockPostData.latitude);
        assert.equal(result.longitude, mockPostData.longitude);
        assert.deepEqual(result.likedBy, [mockUserId]);
    }));
    it("should see post in post list", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield post.getPosts();
        assert.equal(result.length, 1);
        assert.equal(result[0].title, mockPostData.title);
    }));
}));
describe("post actions", () => __awaiter(void 0, void 0, void 0, function* () {
    it("should be able to like post", () => __awaiter(void 0, void 0, void 0, function* () {
        const postId = yield post.createPost(mockPostData, mockUserId);
        const likeResult = yield post.likePost(postId, secondMockUserId);
        assert.equal(likeResult, true);
        const fetchedResult = yield post.getPostDetails(postId);
        assert.equal(fetchedResult.likedBy.length, 2);
        assert.deepEqual(fetchedResult.likedBy, [mockUserId, secondMockUserId]);
    }));
}));
// describe("photo upload creation", async () => {
//     it("should be able to upload photograph", async () => {
//     });
//     it("should be able to upload picture", async () => {
//     });
//     it("should see post in post list", async () => {
//     });
// });