# Firebase setup

## Web app configuration

1. Copy `.env.example` to `.env.local` in the project root.
2. In Firebase Console, open **Project settings → General → Your apps → Web app**.
3. Copy the six `firebaseConfig` values into the matching `VITE_FIREBASE_*` variables.
4. Restart the Vite development server after saving `.env.local`.

These are Firebase web client configuration values, not Admin SDK credentials. Never put a service-account key or Admin SDK credential in this frontend project. `.env.local` is git-ignored.

## Authentication

In Firebase Console, open **Authentication → Sign-in method** and enable **Email/Password**. The app provides email/password sign-in, account creation, and password reset. New accounts can optionally provide a display name.

## Firestore

Create a Firestore database and publish the project's `firestore.rules` rules. The rules require an authenticated user to read comments and create comments with their own UID. Comment editing/deletion is intentionally disabled until the product rules are defined.

Comments are stored at:

```text
posts/{postId}/comments/{commentId}
```

Each comment contains `author` (string), `authorId` (Firebase Auth UID), `content` (string, up to 1000 characters), and `createdAt` (server timestamp).

The app reads academic material records from `contents`. Add documents through a trusted administrative process; client-side writes are denied by the rules. Each document should contain:

```text
title        string
subject      string
type         "PDF" | "Vídeo" | "Slides" | "Link"
author       string
description  string
url          optional HTTPS URL string
rating       optional number
featured     optional boolean
tags         optional array of strings
```

The project currently uses demonstration posts and interaction counts in the feed. Those posts, likes, saved items, and notification data are not yet synchronized to Firestore.
