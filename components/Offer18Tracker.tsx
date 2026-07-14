"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

const STORAGE_KEY = "offer18_click_id";

export default function Offer18Tracker() {
  const { address, isConnected } = useAccount();
  const hasFired = useRef(false);

  // 1. First useEffect: Extract tracking parameter on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const clickId = urlParams.get("click_id");
      
      if (clickId) {
        console.log("[Offer18-Tracker] Captured click_id from URL:", clickId);
        localStorage.setItem(STORAGE_KEY, clickId);
      }
    }
  }, []);

  // 2. Second useEffect: Reactively monitor wallet state and trigger S2S Postback
  useEffect(() => {
    // Prevent execution if we've already fired or if wallet is not connected
    if (hasFired.current || !isConnected || !address) return;

    const storedClickId = localStorage.getItem(STORAGE_KEY);

    if (storedClickId) {
      console.log(`[Offer18-Tracker] Wallet connected (${address}). Firing S2S verify...`);
      hasFired.current = true; // Lock the execution immediately to prevent StrictMode double-fires

      fetch("/api/verify-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          clickId: storedClickId,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            console.log("[Offer18-Tracker] S2S Postback successful. Cleaning up localStorage.");
            localStorage.removeItem(STORAGE_KEY);
          } else {
            console.error("[Offer18-Tracker] S2S Verification rejected by server. Status:", res.status);
            // Optional: reset the lock if we want to allow retries on server failure
            hasFired.current = false;
          }
        })
        .catch((err) => {
          console.error("[Offer18-Tracker] Failed to dispatch S2S verification:", err);
          // Unlock the execution so the user can try reconnecting
          hasFired.current = false;
        });
    } else {
      console.log("[Offer18-Tracker] Wallet connected, but no click_id found (Organic traffic).");
      // Set to true so we don't spam organic traffic logs on re-renders
      hasFired.current = true;
    }
  }, [isConnected, address]);

  // Headless component
  return null;
}
