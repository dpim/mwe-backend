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
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
const user = __importStar(require("../users"));
const post = __importStar(require("../posts"));
const utils_1 = require("./utils");
const test = (0, firebase_functions_test_1.default)({
    projectId: utils_1.projectId
});
const mockUserId = 'user_456';
const mockUserDisplayName = 'test@test.com';
const mockPostData = {
    title: 'test post',
    latitude: 123.456,
    longitude: -78.9
};
before(() => {
    // wrap exactly once
    const wrappedMethod = firebase_admin_1.default.initializeApp;
    if (wrappedMethod && !wrappedMethod.restore) {
        sinon.stub(firebase_admin_1.default, 'initializeApp');
    }
});
after(() => test.cleanup());
describe("empty state", () => __awaiter(void 0, void 0, void 0, function* () {
    it("should fetch empty user", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield user.getUser("111");
        assert.deepEqual(result, null);
    }));
}));
describe("user creation", () => __awaiter(void 0, void 0, void 0, function* () {
    it("should be able to create a user", () => __awaiter(void 0, void 0, void 0, function* () {
        const creationResult = yield user.createUser(mockUserDisplayName, mockUserId);
        assert.equal(creationResult, mockUserId);
        const fetchedResult = yield user.getUser(mockUserId);
        assert.equal(fetchedResult.userId, mockUserId);
        assert.equal(fetchedResult.displayName, mockUserDisplayName);
    }));
    it("should be able to create, fetch linked posts", () => __awaiter(void 0, void 0, void 0, function* () {
        yield user.createUser(mockUserDisplayName, mockUserId);
        const postId = yield post.createPost(mockPostData, mockUserId);
        const fetchedResult = yield user.getUser(mockUserId);
        assert.equal(fetchedResult.userId, mockUserId);
        assert.deepEqual(fetchedResult.likedPosts, [postId]);
        assert.deepEqual(fetchedResult.createdPosts, [postId]);
    }));
}));
