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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFirebaseApp = exports.sendSms = exports.privateKey = exports.storageBucket = void 0;
const admin = __importStar(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const twilio_1 = __importDefault(require("twilio"));
// find .env file in parent dictory
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', '.env') });
const authToken = process.env.INT_TWILIO_AUTH_TOKEN;
const accountSid = process.env.INT_TWILIO_ACCOUNT_SID;
const adminNumber = process.env.INT_TWILIO_ADMIN_NUM;
const apiKey = process.env.INT_FIREBASE_API_KEY;
const authDomain = process.env.INT_FIREBASE_AUTH_DOMAIN;
exports.storageBucket = process.env.INT_FIREBASE_STORAGE_BUCKET;
exports.privateKey = process.env.AUTH_TOKEN_KEY;
const messageClient = (0, twilio_1.default)(accountSid, authToken);
let appStarted = false;
function sendSms(postId) {
    messageClient.messages
        .create({
        body: `Post reported - ${postId}`,
        from: 'whatsapp:+14155238886',
        to: `whatsapp:${adminNumber}`
    });
}
exports.sendSms = sendSms;
const firebaseConfig = {
    apiKey,
    authDomain,
    storageBucket: exports.storageBucket
};
// single instance of initialize app
function startFirebaseApp() {
    if (!appStarted) {
        admin.initializeApp(firebaseConfig);
        appStarted = true;
    }
}
exports.startFirebaseApp = startFirebaseApp;
