import "dotenv/config";
import axios from "axios";

async function test_api() {
    const serverKey = process.env.SB_MIDTRANS_SERVER_KEY;
    if (!serverKey) {
        console.error("❌ SB_MIDTRANS_SERVER_KEY is missing from .env");
        return;
    }

    // Base64 encode the server key for Basic Auth (Key + Colon)
    const authString = Buffer.from(serverKey + ":").toString("base64");
    const url = "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const payload = {
        transaction_details: {
            order_id: `TEST-MANUAL-${Date.now()}`,
            gross_amount: 10000
        },
        credit_card: {
            secure: true
        }
    };

    console.log(`🚀 Testing Request to: ${url}`);
    console.log(`🔑 Auth Header: Basic ${authString.substring(0, 10)}...`);

    try {
        const response = await axios.post(url, payload, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Basic ${authString}`
            }
        });

        console.log("✅ Success!");
        console.log("Token:", response.data.token);
        console.log("Redirect URL:", response.data.redirect_url);
    } catch (error: any) {
        console.error("❌ Request Failed!");
        if (axios.isAxiosError(error)) {
            console.error("Status:", error.response?.status);
            console.error("Status Text:", error.response?.statusText);
            console.error("Response Data:", JSON.stringify(error.response?.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

test_api();
