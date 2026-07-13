import { NextResponse } from "next/server";
import axios from "axios";

// Strictly typed input interfaces
interface VerifyWalletPayload {
  walletAddress: string;
  clickId: string | null;
}

export async function POST(req: Request) {
  try {
    // 1. Accept the POST request payload containing walletAddress and clickId.
    const body: VerifyWalletPayload = await req.json();
    const { walletAddress, clickId } = body;

    console.log(`[S2S Conversion] Received wallet verification request for address: ${walletAddress}`);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: walletAddress" },
        { status: 400 }
      );
    }

    // 2. Check if a clickId is present.
    if (clickId) {
      console.log(`[S2S Conversion] Active clickId found: ${clickId}. Initiating background conversion request...`);

      // 3. The base tracking destination is hardcoded
      const BASE_URL = "https://growstream634474.o18.click/p?m=29851";
      const questToken = process.env.OFFER18_QUEST_TOKEN;

      if (!questToken) {
        console.warn("[S2S Conversion] Warning: OFFER18_QUEST_TOKEN environment variable is not defined!");
      }

      // 4. Dynamically append the query parameters to match the structure
      const trackingUrl = `${BASE_URL}&tid=${clickId}&event=${questToken || ""}`;

      try {
        // Use axios to make a secure background server-side GET request to the external marketing server.
        const trackingResponse = await axios.get(trackingUrl);
        console.log(`[S2S Conversion] Successfully fired conversion pixel. Response status: ${trackingResponse.status}`);
      } catch (trackingError) {
        console.error(`[S2S Conversion] Error firing conversion pixel for clickId ${clickId}:`, trackingError);
        // We log the error but still return success for the wallet verification,
        // so the user experience isn't blocked by a marketing pixel failure.
      }
    } else {
      // Handle edge cases where the user navigates organically without an ad link
      console.log("[S2S Conversion] Organic navigation detected (clickId is null). Skipping marketing conversion pixel.");
    }

    // 5. Return a clean JSON response ({ success: true })
    return NextResponse.json({ success: true });

  } catch (error) {
    // Wrap the call in a robust try/catch block with descriptive console log streams for server debugging
    console.error("[S2S Conversion] Fatal server error processing wallet verification:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
