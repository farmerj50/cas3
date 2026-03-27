"use client";

import { useEffect } from "react";

/**
 * Registers the device for push notifications when running inside a Capacitor
 * native shell (iOS / Android). No-ops silently in a regular browser.
 *
 * Call this once from an authenticated page (e.g., the dashboard) so the token
 * is associated with the logged-in user.
 */
export function usePushNotifications() {
  useEffect(() => {
    async function init() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { PushNotifications } = await import("@capacitor/push-notifications");

        // Request permission (shows the system dialog on first run)
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive !== "granted") return;

        // Register with APNs (iOS) or FCM (Android)
        await PushNotifications.register();

        // Send token to our server so we can target this device
        await PushNotifications.addListener("registration", async (token) => {
          try {
            await fetch("/api/push/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: token.value,
                platform: Capacitor.getPlatform(), // "ios" | "android"
              }),
            });
          } catch {
            // Non-critical — will retry next app launch
          }
        });

        await PushNotifications.addListener("registrationError", (err) => {
          console.error("Push registration error:", err.error);
        });

        // Handle a notification tap while app is in foreground
        await PushNotifications.addListener("pushNotificationReceived", (notification) => {
          console.log("Push received (foreground):", notification.title);
        });

      } catch {
        // Not in a Capacitor environment — safe to ignore
      }
    }

    init();
  }, []);
}
