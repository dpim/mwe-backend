import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import client from 'twilio';

// find .env file in parent dictory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const authToken: string = process.env.INT_TWILIO_AUTH_TOKEN!;
const accountSid: string = process.env.INT_TWILIO_ACCOUNT_SID!;
const adminNumber: string = process.env.INT_TWILIO_ADMIN_NUM!;
const apiKey: string = process.env.INT_FIREBASE_API_KEY!;
const authDomain: string = process.env.INT_FIREBASE_AUTH_DOMAIN!;
export const storageBucket: string = process.env.INT_FIREBASE_STORAGE_BUCKET!;
export const privateKey: string = process.env.AUTH_TOKEN_KEY!;

const messageClient = client(accountSid, authToken);
let appStarted = false;

export function sendSms(postId: string) {
    messageClient.messages
        .create({
            body: `Post reported - ${postId}`,
            from: 'whatsapp:+14155238886',
            to: `whatsapp:${adminNumber}`
        });
}

const firebaseConfig = {
    apiKey,
    authDomain,
    storageBucket
}

// single instance of initialize app
export function startFirebaseApp() {
    if (!appStarted) {
        admin.initializeApp(firebaseConfig);
        appStarted = true;
    }
}