import 'dotenv/config';
import client from 'twilio';
const authToken = '[AuthToken]';
const accountSid = process.env.TWLOACCOUNTSID
const adminNumber = process.env.TWLOADMINNUM

const messageClient = client(accountSid, authToken)

export function sendSms(postId: string){
    messageClient.messages
    .create({
       body: `Post reported - ${postId}`,
       from: 'whatsapp:+14155238886',
       to: `whatsapp:${adminNumber}`
     });
}