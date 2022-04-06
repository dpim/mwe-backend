import 'mocha';
import * as sinon from 'sinon';
import * as assert from 'assert';
import admin from 'firebase-admin';
import firebaseFunctionTest from 'firebase-functions-test';
import * as user from '../users';
import * as post from '../posts';
import { projectId } from './utils';

const test = firebaseFunctionTest({
    projectId
});

const mockUserId = 'user_456';
const mockUserDisplayName = 'test@test.com';

const mockPostData: post.PostInput = {
    title: 'test post',
    latitude: 123.456,
    longitude: -78.9
}

before(() => {
    // wrap exactly once
    const wrappedMethod: any = admin.initializeApp;
    if (wrappedMethod && !wrappedMethod.restore) {
        sinon.stub(admin, 'initializeApp');
    }
});

after(() => test.cleanup());

describe("empty state", async () => {
    it("should fetch empty user", async () => {
        const result = await user.getUser("111");
        assert.deepEqual(result, null);
    });
});

describe("user creation", async () => {
    it("should be able to create a user", async () => {
        const creationResult = await user.createUser(mockUserDisplayName, mockUserId);
        assert.equal(creationResult, mockUserId);
        const fetchedResult = await user.getUser(mockUserId);
        assert.equal(fetchedResult.userId, mockUserId);
        assert.equal(fetchedResult.displayName, mockUserDisplayName);
    });

    it("should be able to create, fetch linked posts", async () => {
        await user.createUser(mockUserDisplayName, mockUserId);
        const postId = await post.createPost(mockPostData, mockUserId);
        const fetchedResult = await user.getUser(mockUserId);
        assert.equal(fetchedResult.userId, mockUserId);
        assert.deepEqual(fetchedResult.likedPosts, [postId]);
        assert.deepEqual(fetchedResult.createdPosts, [postId]);
    });
});