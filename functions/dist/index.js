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
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const users_1 = require("./users");
const posts_1 = require("./posts");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.urlencoded({ extended: true }));
// account routes
app.get('/users/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.params.id;
    const user = yield (0, users_1.getUser)(userId);
    return response.send(user);
}));
app.post('/users/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.params.id;
    const userDisplayName = request.body.displayName;
    if (!userDisplayName) {
        return response.sendStatus(400);
    }
    const user = yield (0, users_1.createUser)(userDisplayName, userId);
    return response.send(user);
}));
// post routes
app.get('/posts', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield (0, posts_1.getPosts)();
    return response.send(posts);
}));
app.get('/posts/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield (0, posts_1.getPostDetails)(request.params.id);
    return response.send(post);
}));
app.post('/posts', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const body = request.body;
    const userId = body.userId;
    const postDetails = {
        title: body.title,
        caption: (_a = body.caption) !== null && _a !== void 0 ? _a : null,
        latitude: body.latitude,
        longitude: body.longitude
    };
    const postId = yield (0, posts_1.createPost)(postDetails, userId);
    return response.send({ postId });
}));
app.post('/posts/:id/upload/:type', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = request.params.id;
    const typeString = request.params.type;
    const type = (typeString === "picture") ? posts_1.ImageType.Painting : posts_1.ImageType.Photograph;
    const imageString = request.body.image;
    try {
        if (imageString) {
            const base64EncodedImageString = imageString.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64EncodedImageString, 'base64');
            yield (0, posts_1.uploadPostImage)(postId, buffer, type);
            return response.sendStatus(201);
        }
        else {
            return response.sendStatus(400);
        }
    }
    catch (_b) {
        return response.sendStatus(500);
    }
}));
app.post('/posts/:id/like', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.body.userId;
    const postId = request.params.id;
    yield (0, posts_1.likePost)(postId, userId);
    return response.sendStatus(201);
}));
app.post('/posts/:id/unlike', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.body.userId;
    const postId = request.params.id;
    yield (0, posts_1.unlikePost)(postId, userId);
    return response.sendStatus(201);
}));
app.post('/posts/:id/report', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.body.userId;
    const postId = request.params.id;
    yield (0, posts_1.reportPost)(postId, userId);
    return response.sendStatus(201);
}));
exports.api = functions.https.onRequest(app);
