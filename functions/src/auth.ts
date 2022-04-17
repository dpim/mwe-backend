import * as jwt from 'jsonwebtoken'
import { privateKey, startFirebaseApp } from './utils';
import { getFirestore } from 'firebase-admin/firestore';
import { Strategy, ExtractJwt } from 'passport-jwt';

startFirebaseApp();
const db = getFirestore();

// generate new token
export async function createToken(userId: string): Promise<any> {
    const token = jwt.sign({ userId }, privateKey);
    const tokenRef = db.collection('tokens').doc(userId);
    await tokenRef.set({
        userId,
        token,
        createdDate: Date.now(),
        lastUpdatedDate: Date.now()
    });
    return token;
}

// renew token
export async function renewToken(oldToken: string): Promise<any> {
    try {
        const decoded: any = jwt.verify(oldToken, privateKey);
        const userId = decoded.userId;
        const newToken = jwt.sign({ userId }, privateKey);
        const tokenRef = db.collection('tokens').doc(userId);
        const tokenEntry = await tokenRef.get();

        // if this token is "renewable", hasn't already been renewed
        if (tokenEntry && tokenEntry.data()) {
            const tokenData: any = tokenEntry.data();
            if (tokenData.token === oldToken){
                await tokenRef.update({ userId, token: newToken, lastUpdatedDate: Date.now() });
                return newToken;
            }
        }
    } catch {
        // do nothing yet
    }
    return null;
}

// strategy for querying back user
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: privateKey
}

export const jwtStrategy = new Strategy(opts, async (jwtPayload: any, done: any) => {
    const userId = jwtPayload.userId;
    const userRef = db.collection('users').doc(userId);
    try {
        const user = await userRef.get();
        if (user && user.data()){
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch {
        return done(null, false);
    }
});