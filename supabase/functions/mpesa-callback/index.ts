// M-Pesa Daraja: Callback receiver (called by Safaricom)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
    console.log("M-Pesa callback received:", JSON.stringify(payload));

    const stk = payload?.Body?.stkCallback;
    if (!stk) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkoutRequestId = stk.CheckoutRequestID;
    const resultCode = Number(stk.ResultCode);
    const resultDesc = String(stk.ResultDesc || "");

    let receipt: string | null = null;
    if (resultCode === 0 && stk.CallbackMetadata?.Item) {
      for (const item of stk.CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber") receipt = String(item.Value);
      }
    }

    const status = resultCode === 0 ? "completed" : "failed";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { error } = await admin
      .from("mpesa_payments")
      .update({
        status,
        result_code: resultCode,
        result_desc: resultDesc,
        mpesa_receipt_number: receipt,
        raw_callback: payload,
        updated_at: new Date().toISOString(),
      })
      .eq("checkout_request_id", checkoutRequestId);

    if (error) console.error("DB update error:", error);

    // Always reply 200 OK to Safaricom
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Callback error:", err);
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
