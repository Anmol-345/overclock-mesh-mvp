"use client";

import { useEffect } from "react";

// Define strict types for the Ethereum provider interface
interface RequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

export default function Offer18Interceptor() {
  useEffect(() => {
    // 1. Parse URL for click_id on mount
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const clickId = urlParams.get("click_id");
      
      if (clickId) {
        console.log("[Offer18] Captured click_id from URL:", clickId);
        localStorage.setItem("offer18_click_id", clickId);
      }
    }

    // Defensive check: Ensure we are in a browser environment with an injected wallet
    if (typeof window === "undefined" || !window.ethereum) {
      console.log("[Offer18] No window.ethereum detected. Interceptor standing by.");
      return;
    }

    // 2. Intercept window.ethereum.request
    const originalRequest = window.ethereum.request.bind(window.ethereum);

    window.ethereum.request = async (args: RequestArguments) => {
      // Pass the request to the original provider first
      const result = await originalRequest(args);

      // 3. Inspect RPC calls related to account connection
      if (args.method === "eth_requestAccounts" || args.method === "eth_accounts") {
        try {
          const accounts = result as string[];
          if (accounts && accounts.length > 0) {
            const walletAddress = accounts[0];
            const storedClickId = localStorage.getItem("offer18_click_id");

            if (storedClickId) {
              console.log(`[Offer18] Wallet connected (${walletAddress}). Firing S2S verify...`);

              // 4. Trigger background verification
              fetch("/api/verify-wallet", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  walletAddress,
                  clickId: storedClickId,
                }),
              })
                .then(async (res) => {
                  if (res.ok) {
                    console.log("[Offer18] S2S Postback successful. Cleaning up localStorage.");
                    localStorage.removeItem("offer18_click_id");
                  } else {
                    console.error("[Offer18] S2S Verification rejected by server.");
                  }
                })
                .catch((err) => {
                  console.error("[Offer18] Failed to dispatch S2S verification:", err);
                });
            } else {
              // Organic traffic (No click_id stored)
              console.log("[Offer18] Wallet connected, but no click_id found (Organic traffic).");
            }
          }
        } catch (err) {
          console.error("[Offer18] Error processing intercepted wallet accounts:", err);
        }
      }

      // Always return the original result so the wallet library (Wagmi/AppKit) functions normally
      return result;
    };

    console.log("[Offer18] Global JSON-RPC interceptor engaged.");

    // Cleanup: Restore original request method on unmount to prevent memory leaks
    return () => {
      if (window.ethereum) {
        window.ethereum.request = originalRequest;
        console.log("[Offer18] Global JSON-RPC interceptor disengaged.");
      }
    };
  }, []);

  // Zero-UI component
  return null;
}
