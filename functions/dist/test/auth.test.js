"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const sinon = __importStar(require("sinon"));
const assert = __importStar(require("assert"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
const auth = __importStar(require("../auth"));
const utils_1 = require("./utils");
const test = (0, firebase_functions_test_1.default)({
    projectId: utils_1.projectId
});
const mockUserId = 'user_456';
before(() => {
    // wrap exactly once
    const wrappedMethod = firebase_admin_1.default.initializeApp;
    if (wrappedMethod && !wrappedMethod.restore) {
        sinon.stub(firebase_admin_1.default, 'initializeApp');
    }
});
after(() => test.cleanup());
describe("token creation", () => __awaiter(void 0, void 0, void 0, function* () {
    it("should be able to create and refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenResult = yield auth.createToken(mockUserId);
        assert.notEqual(null, tokenResult);
        assert.equal(true, tokenResult.startsWith("ey"));
        const refreshedResult = yield auth.renewToken(tokenResult);
        assert.equal(true, refreshedResult.startsWith("ey"));
        assert.notEqual(null, refreshedResult);
        assert.notEqual(tokenResult, refreshedResult);
    }));
    it("should not refresh bad token", () => __awaiter(void 0, void 0, void 0, function* () {
        const fakeToken = "ey123";
        const refreshedResult = yield auth.renewToken(fakeToken);
        assert.equal(null, refreshedResult);
    }));
}));
