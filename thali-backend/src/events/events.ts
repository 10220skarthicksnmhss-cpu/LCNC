// src/events/events.ts — Event type definitions

export enum AppEvent {
  IngredientPriceUpdated  = 'IngredientPriceUpdated',
  MealPriceRecalculated   = 'MealPriceRecalculated',
  PriceSpikeDetected      = 'PriceSpikeDetected',
  NotificationScheduled   = 'NotificationScheduled',
  NotificationSent        = 'NotificationSent',
  UserResponded           = 'UserResponded',
  ResponseTimeout         = 'ResponseTimeout',
  DecisionEvaluated       = 'DecisionEvaluated',
  OrderLocked             = 'OrderLocked',
  RestaurantOrderCreated  = 'RestaurantOrderCreated',
}

export interface IngredientPriceUpdatedPayload {
  ingredientId:   string;
  ingredientName: string;
  oldPrice:       number;
  newPrice:       number;
  spikePct:       number;
}

export interface MealPriceRecalculatedPayload {
  mealId:   string;
  oldPrice: number;
  newPrice: number;
}

export interface PriceSpikeDetectedPayload {
  alertId:        string;
  userId:         string;
  subscriptionId: string;
  mealId:         string;
  mealName:       string;
  oldPrice:       number;
  newPrice:       number;
  spikePct:       number;
  spikeReason:    string;
}

export interface OrderLockedPayload {
  orderId:       string;
  userId:        string;
  mealId:        string;
  mealName:      string;
  finalPrice:    number;
  aiDecision:    boolean;
  decisionTrail: string;
}
