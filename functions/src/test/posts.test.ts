import 'mocha';
import * as assert from 'assert';
import * as post from '../posts';
import { projectId } from './utils';
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

after(() => test.cleanup());

describe("empty state", async () => {
    it("should fetch empty posts", async () => {
        const result = await post.getPosts();
        assert.equal(result, []);
    });

    it("should fetch empty specific post", async () => {
        const result = await post.getPostDetails("123");
        assert.equal(result, null);
    });
});

describe("post creation", async () => {
    it("should create new post", async () => {
        const result = await post.createPost(mockPostData, mockUserId);
        assert.equal(result, null);
    });

    it("should be able to fetch this post", async () => {
        const result = await post.getPostDetails("123");
        assert.equal(result, null);
    });

    it("should see post in post list", async () => {
        const result = await post.getPosts();
        assert.equal(result, []);
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

// describe("post actions", async () => {
//     it("should be able to like post", async () => {

//     });
// });