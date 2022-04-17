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
const passport_1 = __importDefault(require("passport"));
const User = __importStar(require("./users"));
const Post = __importStar(require("./posts"));
const Auth = __importStar(require("./auth"));
passport_1.default.use(Auth.jwtStrategy);
const jwtMiddleware = passport_1.default.authenticate('jwt', { session: false });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(passport_1.default.initialize());
// get JWT from id token
app.post('/token', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield Auth.createToken(request.params.id);
    return response.send({ token });
}));
// get JWT from id token
app.post('/token/renew', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield Auth.renewToken(request.params.token);
    if (token) {
        return response.send({ token });
    }
    return response.sendStatus(400);
}));
// account routes
app.get('/users/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const requestUser = request.user;
    const userId = requestUser.id;
    const user = yield User.getUser(userId);
    return response.send(user);
}));
app.post('/users/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const requestUser = request.user;
    const userId = requestUser.id;
    const userDisplayName = request.body.displayName;
    if (!userDisplayName) {
        return response.sendStatus(400);
    }
    const user = yield User.createUser(userDisplayName, userId);
    return response.send(user);
}));
// post routes
app.get('/posts', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield Post.getPosts();
    return response.send(posts);
}));
app.get('/posts/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post.getPostDetails(request.params.id);
    return response.send(post);
}));
app.post('/posts', jwtMiddleware, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const body = request.body;
    const requestUser = request.user;
    const userId = requestUser.id;
    const postDetails = {
        title: body.title,
        caption: (_a = body.caption) !== null && _a !== void 0 ? _a : null,
        latitude: body.latitude,
        longitude: body.longitude
    };
    const postId = yield Post.createPost(postDetails, userId);
    return response.send({ postId });
}));
app.post('/posts/:id/upload/:type', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = request.params.id;
    const typeString = request.params.type;
    const type = (typeString === "picture") ? Post.ImageType.Painting : Post.ImageType.Photograph;
    const imageString = request.body.image;
    try {
        if (imageString) {
            const base64EncodedImageString = imageString.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64EncodedImageString, 'base64');
            yield Post.uploadPostImage(postId, buffer, type);
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
app.post('/posts/:id/like', jwtMiddleware, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const requestUser = request.user;
    const userId = requestUser.id;
    const postId = request.params.id;
    yield Post.likePost(postId, userId);
    return response.sendStatus(201);
}));
app.post('/posts/:id/unlike', jwtMiddleware, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const requestUser = request.user;
    const userId = requestUser.id;
    const postId = request.params.id;
    yield Post.unlikePost(postId, userId);
    return response.sendStatus(201);
}));
app.post('/posts/:id/report', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const requestUser = request.user;
    const userId = requestUser.id;
    const postId = request.params.id;
    yield Post.reportPost(postId, userId);
    return response.sendStatus(201);
}));
app.post('/posts/:id/delete', jwtMiddleware, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const requestUser = request.user;
    const userId = requestUser.id;
    const postId = request.params.id;
    yield Post.deletePost(postId, userId);
    return response.sendStatus(201);
}));
exports.api = functions.https.onRequest(app);
