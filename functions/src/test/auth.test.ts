import 'mocha';
import * as sinon from 'sinon';
import * as assert from 'assert';
import admin from 'firebase-admin';
import firebaseFunctionTest from 'firebase-functions-test';
import * as auth from '../auth';
import { projectId } from './utils';

const test = firebaseFunctionTest({
    projectId
});

const mockUserId = 'user_456';

before(() => {
    // wrap exactly once
    const wrappedMethod: any = admin.initializeApp;
    if (wrappedMethod && !wrappedMethod.restore) {
        sinon.stub(admin, 'initializeApp');
    }
});

after(() => test.cleanup());

describe("token creation", async () => {
    it("should be able to create and refresh token", async () => {
        const tokenResult: string = await auth.createToken(mockUserId);
        assert.notEqual(null, tokenResult);
        assert.equal(true, tokenResult.startsWith("ey"));
        const refreshedResult = await auth.renewToken(tokenResult);
        assert.equal(true, refreshedResult.startsWith("ey"));
        assert.notEqual(null, refreshedResult);
        assert.notEqual(tokenResult, refreshedResult);
    });

    it("should not refresh bad token", async () => {
        const fakeToken = "ey123"
        const refreshedResult = await auth.renewToken(fakeToken);
        assert.equal(null, refreshedResult);
    });
});