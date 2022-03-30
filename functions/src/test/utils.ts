import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.join(__dirname, '../..', '.env')});

export const projectId = process.env.INT_FIREBASE_PROJECT_ID;
