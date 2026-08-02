// src/shared/utils/price.utils.ts
import { env } from '../../config/env';

export interface PriceBreakdown {
  ingredientCost: number;
  restaurantMargin: number;
  packagingCost: number;
  gstAmount: number;
  platformFee: number;
  totalPrice: number;
}

/**
 * Computes the full meal price from raw ingredient cost.
 *
 * Formula:
 *   margin       = ingredientCost × marginPct%
 *   packaging    = fixed (env.PACKAGING_COST)
 *   gst          = (ingredientCost + margin + packaging) × GST_PCT%
 *   platformFee  = ingredientCost × PLATFORM_COMMISSION_PCT%
 *   total        = ingredientCost + margin + packaging + gst + platformFee
 */
export function computeMealPrice(
  ingredientCost: number,
  restaurantMarginPct: number,
): PriceBreakdown {
  const restaurantMargin = round(ingredientCost * (restaurantMarginPct / 100));
  const packagingCost    = env.PACKAGING_COST;
  const subtotal         = ingredientCost + restaurantMargin + packagingCost;
  const gstAmount        = round(subtotal * (env.GST_PCT / 100));
  const platformFee      = round(ingredientCost * (env.PLATFORM_COMMISSION_PCT / 100));
  const totalPrice       = round(subtotal + gstAmount + platformFee);

  return { ingredientCost: round(ingredientCost), restaurantMargin, packagingCost, gstAmount, platformFee, totalPrice };
}

/**
 * Calculates spike percentage between two prices.
 * Returns null if oldPrice is 0 or negative.
 */
export function calcSpikePct(oldPrice: number, newPrice: number): number | null {
  if (oldPrice <= 0) return null;
  return round(((newPrice - oldPrice) / oldPrice) * 100);
}

export function round(value: number, decimals = 2): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
