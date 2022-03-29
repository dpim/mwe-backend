"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseConfig = exports.sendSms = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const twilio_1 = __importDefault(require("twilio"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', '.env') });
const authToken = '[AuthToken]';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const adminNumber = process.env.TWILIO_ADMIN_NUM;
const messageClient = (0, twilio_1.default)(accountSid, authToken);
function sendSms(postId) {
    messageClient.messages
        .create({
        body: `Post reported - ${postId}`,
        from: 'whatsapp:+14155238886',
        to: `whatsapp:${adminNumber}`
    });
}
exports.sendSms = sendSms;
const apiKey = process.env.FIREBASE_API_KEY;
const authDomain = process.env.FIREBASE_AUTH_DOMAIN;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
exports.firebaseConfig = {
    apiKey,
    authDomain,
    storageBucket
};
