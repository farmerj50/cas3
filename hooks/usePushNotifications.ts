"use client";

import { useEffect } from "react";

export function usePushNotifications() {
  useEffect(() => {
    // Push notifications require Firebase (google-services.json) which is not
    // yet configured. This hook is a no-op until FCM is set up.
  }, []);
}
