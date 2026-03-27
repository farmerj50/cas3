/**
 * Server-side push notification sender using Firebase Admin SDK.
 *
 * Setup:
 * 1. Go to console.firebase.google.com → Project Settings → Service Accounts
 * 2. Click "Generate new private key" → download the JSON file
 * 3. Stringify it: JSON.stringify(require('./serviceAccountKey.json'))
 * 4. Set FIREBASE_SERVICE_ACCOUNT=<that string> in .env.local
 */

import type { App } from "firebase-admin/app";

let _app: App | null = null;

function getApp(): App {
  if (_app) return _app;

  // Dynamic import avoids loading firebase-admin on every cold start
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const admin = require("firebase-admin");

  if (admin.apps.length) {
    _app = admin.apps[0];
    return _app!;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env var is not set.");

  _app = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(raw)),
  });
  return _app!;
}

export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

/**
 * Send a push notification to one or more device tokens.
 * Silently skips if FIREBASE_SERVICE_ACCOUNT is not configured.
 */
export async function sendPush(tokens: string[], payload: PushPayload) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return;
  if (tokens.length === 0) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require("firebase-admin");
    const app = getApp();
    const messaging = admin.messaging(app);

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data ?? {},
      apns: {
        payload: {
          aps: { sound: "default", badge: 1 },
        },
      },
      android: {
        priority: "high",
        notification: { sound: "default" },
      },
    });

    return response;
  } catch (err) {
    console.error("[push] Failed to send notification:", err);
  }
}
