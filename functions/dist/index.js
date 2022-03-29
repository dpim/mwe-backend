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
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const users_1 = require("./users");
const posts_1 = require("./posts");
const multerMiddleware = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
    }
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
// exports.helloWorld = functions.https.onRequest((request: Request, response: Response) => {
//    functions.logger.info("Hello logs!", {structuredData: true});
//    response.send("Hello from Firebase!");
// });
// account routes
app.get('/users/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.params.id;
    const user = yield (0, users_1.getUser)(userId);
    response.send(user);
}));
app.post('/users/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.params.id;
    const userDisplayName = request.body.displayName;
    if (!userDisplayName) {
        response.sendStatus(400);
    }
    const user = yield (0, users_1.createUser)(userDisplayName, userId);
    response.send(user);
}));
// post routes
app.get('/posts', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield (0, posts_1.getPosts)();
    response.send(posts);
}));
app.get('/posts/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield (0, posts_1.getPostDetails)(request.params.id);
    response.send(post);
}));
app.post('/posts', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const body = request.body;
    const userId = request.body.userId;
    const postDetails = {
        title: body.title,
        caption: body.caption,
        latitude: body.latitude,
        longitude: body.longitude
    };
    const post = yield (0, posts_1.createPost)(postDetails, userId);
    response.send(post);
}));
app.post('/posts/:id/photo', multerMiddleware.single('file'), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const image = (_a = request.file) === null || _a === void 0 ? void 0 : _a.buffer;
    const postId = request.params.id;
    const userId = request.body.userId;
    const type = posts_1.ImageType.Photograph;
    if (image) {
        yield (0, posts_1.uploadPostImage)(postId, image, userId, type);
        response.sendStatus(201);
    }
    else {
        response.sendStatus(400);
    }
}));
app.post('/posts/:id/picture', multerMiddleware.single('file'), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const image = (_b = request.file) === null || _b === void 0 ? void 0 : _b.buffer;
    const postId = request.params.id;
    const userId = request.body.userId;
    const type = posts_1.ImageType.Painting;
    if (image) {
        yield (0, posts_1.uploadPostImage)(postId, image, userId, type);
        response.sendStatus(201);
    }
    else {
        response.sendStatus(400);
    }
}));
app.post('/posts/:id/like', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.body.userId;
    const postId = request.params.id;
    yield (0, posts_1.likePost)(postId, userId);
    response.sendStatus(201);
}));
app.post('/posts/:id/report', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.body.userId;
    const postId = request.params.id;
    yield (0, posts_1.reportPost)(postId, userId);
    response.sendStatus(201);
}));
exports.api = functions.https.onRequest(app);
