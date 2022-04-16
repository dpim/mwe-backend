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
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtStrategy = exports.renewToken = exports.createToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const utils_1 = require("./utils");
const firestore_1 = require("firebase-admin/firestore");
const passport_jwt_1 = require("passport-jwt");
(0, utils_1.startFirebaseApp)();
const db = (0, firestore_1.getFirestore)();
// generate new token
function createToken(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = jwt.sign({ userId }, utils_1.privateKey, { algorithm: 'RS256' });
        const tokenRef = db.collection('tokens').doc(userId);
        yield tokenRef.set({
            userId,
            token,
            createdDate: Date.now(),
            lastUpdatedDate: Date.now()
        });
        return token;
    });
}
exports.createToken = createToken;
// renew token
function renewToken(oldToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const decoded = jwt.verify(oldToken, utils_1.privateKey);
        const userId = decoded.userId;
        const newToken = jwt.sign({ userId }, utils_1.privateKey, { algorithm: 'RS256' });
        const tokenRef = db.collection('tokens').doc(userId);
        const tokenEntry = yield tokenRef.get();
        // if this token is "renewable", hasn't already been renewed
        if (tokenEntry && tokenEntry.data()) {
            const tokenData = tokenEntry.data();
            if (tokenData.token === oldToken) {
                yield tokenRef.update({ userId, token: newToken, lastUpdatedDate: Date.now() });
                return newToken;
            }
        }
        return null;
    });
}
exports.renewToken = renewToken;
// strategy for querying back user
const opts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: utils_1.privateKey
};
exports.jwtStrategy = new passport_jwt_1.Strategy(opts, (jwtPayload, done) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = jwtPayload.userId;
    const userRef = db.collection('users').doc(userId);
    try {
        const user = yield userRef.get();
        if (user && user.data()) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    }
    catch (_a) {
        return done(null, false);
    }
}));
