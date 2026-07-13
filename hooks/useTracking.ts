"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "offer18_click_id";

export function useTracking() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Run immediately when a user hits our /dashboard landing route.
    if (typeof window === "undefined") return;

    // 2. Check the URL query strings for a parameter named click_id.
    const clickId = searchParams.get("click_id");
    
    if (clickId) {
      // Store it securely in localStorage as offer18_click_id.
      localStorage.setItem(STORAGE_KEY, clickId);
      console.log("[Tracking] Captured and stored click_id:", clickId);
    }
  }, [searchParams]);

  // 3. Handler function called handlePostWalletConnect(walletAddress: string)
  // Executes right after a user successfully hooks up their Web3 wallet.
  const handlePostWalletConnect = useCallback(async (walletAddress: string) => {
    if (typeof window === "undefined") return;

    try {
      // 4. Grab the offer18_click_id from localStorage
      const clickId = localStorage.getItem(STORAGE_KEY);
      
      console.log(`[Tracking] Initiating wallet verification for: ${walletAddress}`);

      // Send an asynchronous POST fetch request to our internal API endpoint
      const response = await fetch("/api/verify-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          clickId: clickId || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("[Tracking] Wallet verified successfully.");
        // Clear the localStorage item upon a successful response
        if (clickId) {
          localStorage.removeItem(STORAGE_KEY);
          console.log("[Tracking] Cleared click_id from localStorage.");
        }
      } else {
        console.error("[Tracking] Wallet verification failed:", data.error);
      }
    } catch (error) {
      console.error("[Tracking] Error during wallet verification:", error);
    }
  }, []);

  return { handlePostWalletConnect };
}
