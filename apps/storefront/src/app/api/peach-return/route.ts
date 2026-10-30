import { placeOrder } from "@lib/data/cart"
import { getCartId } from "@lib/data/cookies"
import { NextRequest, NextResponse } from "next/server"
import { unstable_rethrow } from "next/navigation"

export async function GET(req: NextRequest) {
  const cartId = await getCartId()
  // The browser's existing cart is authoritative, never a cart ID or success
  // flag supplied by the payment return URL. Medusa authorizes against Peach.
  if (!cartId) return NextResponse.redirect(new URL("/cart", req.url))
  try {
    await placeOrder(cartId)
  } catch (error) {
    unstable_rethrow(error)
  }
  return NextResponse.redirect(new URL("/cart?error=payment_pending", req.url))
}
