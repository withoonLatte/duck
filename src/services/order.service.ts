import { CreateOrderRequest } from '@/types/domain';

export class OrderDomainService {
  /**
   * Calculates totals and creates line item snapshots
   */
  static calculateOrderTotals(items: { unitPrice: number; quantity: number; modifierTotal: number }[]) {
    const subtotal = items.reduce((acc, item) => {
      const lineTotal = (item.unitPrice + item.modifierTotal) * item.quantity;
      return acc + lineTotal;
    }, 0);

    const taxTotal = Math.round((subtotal * 0.07) * 100) / 100;
    const grandTotal = subtotal + taxTotal;

    return {
      subtotal,
      discountTotal: 0,
      taxTotal,
      serviceCharge: 0,
      grandTotal,
    };
  }

  /**
   * Validates Order State Transitions based on Phase 0 State Machine
   */
  static canTransitionOrder(fromState: string, toState: string, hasManagerPin: boolean = false): boolean {
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['SENT_TO_KITCHEN', 'CANCELLED'],
      SENT_TO_KITCHEN: ['PREPARING', 'VOIDED'],
      PREPARING: ['PARTIALLY_READY', 'READY', 'VOIDED'],
      PARTIALLY_READY: ['READY', 'VOIDED'],
      READY: ['SERVED'],
      SERVED: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
      VOIDED: []
    };

    if (toState === 'VOIDED' && !hasManagerPin) {
      return false;
    }

    return (validTransitions[fromState] || []).includes(toState);
  }
}
