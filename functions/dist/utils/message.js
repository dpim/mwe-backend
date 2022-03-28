"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSms = void 0;
require("dotenv/config");
const twilio_1 = __importDefault(require("twilio"));
const authToken = '[AuthToken]';
const accountSid = process.env.TWLOACCOUNTSID;
const adminNumber = process.env.TWLOADMINNUM;
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
