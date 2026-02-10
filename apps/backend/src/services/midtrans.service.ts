import midtransClient from "midtrans-client";
import crypto from "crypto";
import axios, { AxiosError } from "axios";

const is_production = process.env.NODE_ENV === "production";

// Initialize Snap Client
const snap = new midtransClient.Snap({
    isProduction: is_production,
    serverKey: is_production ? process.env.PROD_MIDTRANS_SERVER_KEY : process.env.SB_MIDTRANS_SERVER_KEY,
    clientKey: is_production ? process.env.PROD_MIDTRANS_CLIENT_KEY : process.env.SB_MIDTRANS_CLIENT_KEY,
});

console.log("Snap Client Initialized:", {
    isProduction: is_production,
    apiConfig: (snap as any).apiConfig ? (snap as any).apiConfig.getCoreApiBaseUrl() : 'unknown'
});

/**
 * create_snap_transaction
 * Generates a Snap Token for frontend checkout
 * @param order_id string
 * @param gross_amount number (IDR)
 * @returns { token: string, redirect_url: string }
 */
export async function create_snap_transaction(order_id: string, gross_amount: number) {
    const parameter = {
        transaction_details: {
            order_id: order_id,
            gross_amount: gross_amount,
        },
        credit_card: {
            secure: true,
        },
    };

    try {
        console.log("Preparing Snap Transaction with params:", JSON.stringify(parameter, null, 2));
        const transaction = await snap.createTransaction(parameter);
        console.log("Snap Transaction Created:", transaction);
        return {
            token: transaction.token,
            redirect_url: transaction.redirect_url,
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Midtrans Axios Error:", error.message);
            console.error("Midtrans Data:", JSON.stringify(error.response?.data, null, 2));
        } else {
            console.error("Midtrans Error:", JSON.stringify(error, null, 2));
            console.error("Midtrans Message:", (error as any).message);
        }
        throw new Error("Failed to create Snap transaction");
    }
}

/**
 * verify_signature
 * Verifies the signature key from Midtrans webhook
 * Rule: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verify_signature(
    order_id: string,
    status_code: string,
    gross_amount: string,
    signature_key: string
): boolean {
    const server_key = process.env.MIDTRANS_SERVER_KEY || "";
    const input = order_id + status_code + gross_amount + server_key;
    const signature = crypto.createHash("sha512").update(input).digest("hex");

    return signature === signature_key;
}
