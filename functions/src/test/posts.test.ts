import 'mocha';
import * as sinon from 'sinon';
import * as assert from 'assert';
import * as post from '../posts';
import { projectId } from './utils';
import admin from 'firebase-admin';
import firebaseFunctionTest from "firebase-functions-test";

const test = firebaseFunctionTest({
    projectId
});

const mockPostData: post.PostInput = {
    title: "test post",
    latitude: 123.456,
    longitude: -78.9
}
const mockUserId = "user_123";
const secondMockUserId = "user_456";

before(() => {
    sinon.stub(admin, 'initializeApp');
});

after(() => test.cleanup());

describe("empty state", async () => {
    it("should fetch empty posts", async () => {
        const result = await post.getPosts();
        assert.deepEqual(result, []);
    });

    it("should fetch empty specific post", async () => {
        const result = await post.getPostDetails("123");
        assert.equal(result, null);
    });
});

describe("post creation", async () => {
    it("should create new post", async () => {
        const postId = await post.createPost(mockPostData, mockUserId);
        assert.notEqual(postId, null);

        const result = await post.getPostDetails(postId);
        assert.equal(result.id, postId);
        assert.equal(result.title, mockPostData.title);
        assert.equal(result.createdBy, mockUserId);
        assert.equal(result.caption, mockPostData.caption);
        assert.equal(result.latitude, mockPostData.latitude);
        assert.equal(result.longitude, mockPostData.longitude);
        assert.deepEqual(result.likedBy, [ mockUserId]);
    });

    it("should see post in post list", async () => {
        const result = await post.getPosts();
        assert.equal(result.length, 1);
        assert.equal(result[0].title, mockPostData.title);
    });
});

describe("post actions", async () => {
    it("should be able to like post", async () => {
        const postId = await post.createPost(mockPostData, mockUserId);
        const likeResult = await post.likePost(postId, secondMockUserId);
        assert.equal(likeResult, true);
        const fetchedResult = await post.getPostDetails(postId);
        assert.equal(fetchedResult.likedBy.length, 2);
        assert.deepEqual(fetchedResult.likedBy, [ mockUserId, secondMockUserId]);
    });
});

// describe("photo upload creation", async () => {
//     it("should be able to upload photograph", async () => {

//     });

//     it("should be able to upload picture", async () => {

//     });

//     it("should see post in post list", async () => {

//     });
// });