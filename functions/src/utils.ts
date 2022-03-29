import dotenv from 'dotenv';
import path from 'path';
import client from 'twilio';

dotenv.config({path: path.join(__dirname, '..', '.env')});

const authToken = '[AuthToken]';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const adminNumber = process.env.TWILIO_ADMIN_NUM;
const messageClient = client(accountSid, authToken);

export function sendSms(postId: string){
    messageClient.messages
    .create({
       body: `Post reported - ${postId}`,
       from: 'whatsapp:+14155238886',
       to: `whatsapp:${adminNumber}`
     });
}

const apiKey = process.env.FIREBASE_API_KEY;
const authDomain = process.env.FIREBASE_AUTH_DOMAIN;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

export const firebaseConfig = {
    apiKey,
    authDomain,
    storageBucket
}

