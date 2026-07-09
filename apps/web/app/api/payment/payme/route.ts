import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Payme API mock webhook handler for MVP
// Payme sends POST requests to this endpoint for billing transactions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, params, id } = body;

    // Validate authentication (Basic Auth for Payme)
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Basic ${Buffer.from(`Paycom:${process.env.PAYME_MERCHANT_KEY}`).toString("base64")}`;
    
    // During local dev or if no key is set, we bypass strict auth for testing
    if (process.env.NODE_ENV === "production" && authHeader !== expectedAuth) {
      return NextResponse.json({
        error: { code: -32504, message: "Avtorizatsiyadan o'tishda xatolik", data: "auth" },
        id
      });
    }

    const sb = getSupabaseAdmin();

    switch (method) {
      case "CheckPerformTransaction": {
        // Validate if member exists and payment is valid
        const { account } = params;
        const memberId = account?.member_id;
        
        if (!memberId) {
          return NextResponse.json({ error: { code: -31050, message: "Mijoz topilmadi" }, id });
        }
        
        const { data: member } = await sb.from("users").select("id").eq("id", memberId).single();
        if (!member) {
          return NextResponse.json({ error: { code: -31050, message: "Mijoz topilmadi" }, id });
        }

        return NextResponse.json({ result: { allow: true }, id });
      }

      case "CreateTransaction": {
        // Create the transaction in our DB
        const { id: transId, time, amount, account } = params;
        
        // For MVP, we directly insert a pending payment
        await sb.from("payments").insert({
          id: transId,
          member_id: account.member_id,
          gym_id: account.gym_id,
          amount: amount / 100, // Payme sends tiyin
          status: "pending",
          currency: "UZS",
          type: "monthly" // simplified for MVP
        });

        return NextResponse.json({
          result: {
            create_time: new Date().getTime(),
            transaction: transId,
            state: 1 // created
          },
          id
        });
      }

      case "PerformTransaction": {
        const { id: transId } = params;
        
        // Update payment to confirmed
        await sb.from("payments").update({
          status: "confirmed",
          paid_date: new Date().toISOString()
        }).eq("id", transId);

        return NextResponse.json({
          result: {
            transaction: transId,
            perform_time: new Date().getTime(),
            state: 2 // performed
          },
          id
        });
      }

      case "CancelTransaction": {
        const { id: transId, reason } = params;
        
        // Update payment to rejected/cancelled
        await sb.from("payments").update({
          status: "rejected",
          reject_reason: `Cancelled by user/system. Reason ID: ${reason}`
        }).eq("id", transId);

        return NextResponse.json({
          result: {
            transaction: transId,
            cancel_time: new Date().getTime(),
            state: -1
          },
          id
        });
      }

      case "CheckTransaction": {
        const { id: transId } = params;
        const { data: pay } = await sb.from("payments").select("status, created_at, paid_date").eq("id", transId).single();
        
        if (!pay) {
          return NextResponse.json({ error: { code: -31003, message: "Tranzaksiya topilmadi" }, id });
        }
        
        let state = 1;
        if (pay.status === "confirmed") state = 2;
        if (pay.status === "rejected") state = -1;
        
        return NextResponse.json({
          result: {
            create_time: new Date(pay.created_at).getTime(),
            perform_time: pay.paid_date ? new Date(pay.paid_date).getTime() : 0,
            cancel_time: 0,
            transaction: transId,
            state,
            reason: null
          },
          id
        });
      }

      default:
        return NextResponse.json({ error: { code: -32601, message: "Metod topilmadi" }, id });
    }
  } catch (error) {
    return NextResponse.json({ error: { code: -32400, message: "Tizim xatosi" }, id: null });
  }
}
