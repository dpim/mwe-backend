# mwe-backend

## Background
[Mwe](https://github.com/dpim/mwe) is a simple location-based art sharing application, built in SwiftUI

This repo contains the serverless backend (storage and business logic) for creating new posts, updating posts and querying users

## Installation
- Install top-level dependencies: node.js/npm, typescript (tsc and tslint) and firebase 
- Install npm dependencies (running `npm install` under `functions/src/`)
- Create a new [Firebase project](https://firebase.google.com/)
- Update Firebase config (`.firebaserc` with your Firebase project name)

## Testing
- Some unit tests are included, run via `npm run test` under `functions/`