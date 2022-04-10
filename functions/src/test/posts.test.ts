import 'mocha';
import * as sinon from 'sinon';
import * as assert from 'assert';
import * as fs from 'fs';
import admin from 'firebase-admin';
import firebaseFunctionTest from 'firebase-functions-test';
import * as post from '../posts';
import * as user from '../users';
import { projectId } from './utils';

const test = firebaseFunctionTest({
    projectId
});

const mockPostData: post.PostInput = {
    title: 'test post',
    latitude: 123.456,
    longitude: -78.9
}
const mockUserId = 'user_123';
const secondMockUserId = 'user_456';
const mockImageFixturePath1 = 'src/test/fixtures/emoji1.png';
const mockImageFixturePath2 = 'src/test/fixtures/emoji2.png';

before(() => {
    // wrap exactly once
    const wrappedMethod: any = admin.initializeApp;
    if (wrappedMethod && !wrappedMethod.restore) {
        sinon.stub(admin, 'initializeApp');
    }
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
    // create initial user
    await user.createUser("test", mockUserId);

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
        assert.deepEqual(result.likedBy, [mockUserId]);
    });

    it("should see post in post list", async () => {
        const result = await post.getPosts();
        assert.equal(result.length, 1);
        assert.equal(result[0].title, mockPostData.title);
    });
});

describe("post actions", async () => {
    it("should be able to like post", async () => {
        await user.createUser("test@test.com", secondMockUserId);
        const postId = await post.createPost(mockPostData, mockUserId);
        const likeResult = await post.likePost(postId, secondMockUserId);
        assert.equal(likeResult, true);
        const fetchedResult = await post.getPostDetails(postId);
        assert.equal(fetchedResult.likedBy.length, 2);
        assert.deepEqual(fetchedResult.likedBy, [mockUserId, secondMockUserId]);
    });

    it("should be able to delete own post", async () => {
        await user.createUser("test@test.com", mockUserId);
        const postId = await post.createPost(mockPostData, mockUserId);
        await post.deletePost(postId, mockUserId)
        const fetchedResult = await post.getPostDetails(postId);
        assert.equal(fetchedResult, null);
    });

    it("should not be able to delete other's post", async () => {
        await user.createUser("test@test.com", mockUserId);
        const postId = await post.createPost(mockPostData, mockUserId);
        await post.deletePost(postId, secondMockUserId)
        const fetchedResult = await post.getPostDetails(postId);
        assert.notEqual(fetchedResult, null);
    });
});

describe("photo upload creation", async () => {
    it("should be able to upload images", async () => {
        const postId = await post.createPost(mockPostData, mockUserId);
        const paintingImage = await fs.promises.readFile(mockImageFixturePath1);
        const photoImage = await fs.promises.readFile(mockImageFixturePath2);
        const paintingImageBuffer = Buffer.from(paintingImage);
        const photoImageBuffer = Buffer.from(photoImage);
        const paintingResult = await post.uploadPostImage(postId, paintingImageBuffer, post.ImageType.Painting);
        const photoResult = await post.uploadPostImage(postId, photoImageBuffer, post.ImageType.Photograph);
        assert.equal(paintingResult, true);
        assert.equal(photoResult, true);
        const fetchedResult = await post.getPostDetails(postId);
        assert.notEqual(fetchedResult.paintingUrl, null);
        assert.notEqual(fetchedResult.photographUrl, null);
    });
});