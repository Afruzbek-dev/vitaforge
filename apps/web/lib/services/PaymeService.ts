export class PaymeService {
  /**
   * Generates a Payme checkout URL (sandbox/production)
   */
  static generateCheckoutUrl(amountUzs: number, memberId: string, gymId: string) {
    const isProd = process.env.NODE_ENV === "production";
    const merchantId = process.env.PAYME_MERCHANT_ID || "demo_merchant_id";
    
    // Amount should be in tiyin (uzs * 100)
    const tiyin = Math.round(amountUzs * 100);
    
    // account parameters base64 encoded
    const params = `m=${merchantId};ac.member_id=${memberId};ac.gym_id=${gymId};a=${tiyin}`;
    const base64Params = Buffer.from(params).toString("base64");
    
    const baseUrl = isProd ? "https://checkout.paycom.uz" : "https://test.paycom.uz";
    
    return `${baseUrl}/${base64Params}`;
  }
}
