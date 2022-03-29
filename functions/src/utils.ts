import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import client from 'twilio';

// find .env file in parent dictory
dotenv.config({path: path.join(__dirname, '..', '.env')});

const authToken = process.env.INT_TWILIO_AUTH_TOKEN;
const accountSid = process.env.INT_TWILIO_ACCOUNT_SID;
const adminNumber = process.env.INT_TWILIO_ADMIN_NUM;
const apiKey = process.env.INT_FIREBASE_API_KEY;
const authDomain = process.env.INT_FIREBASE_AUTH_DOMAIN;
const storageBucket = process.env.INT_FIREBASE_STORAGE_BUCKET;

const messageClient = client(accountSid, authToken);
let appStarted = false;

export function sendSms(postId: string){
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
export function startFirebaseApp(){
    if (!appStarted){
        admin.initializeApp(firebaseConfig);
        appStarted = true;
    }
}