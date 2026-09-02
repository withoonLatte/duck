export class BillingDomainService {
  /**
   * Validates Bill State Transitions based on Phase 0 State Machine
   */
  static canTransitionBill(fromState: string, toState: string): boolean {
    const validTransitions: Record<string, string[]> = {
      OPEN: ['PARTIALLY_PAID', 'PAID', 'VOID', 'MERGED', 'SPLIT'],
      PARTIALLY_PAID: ['PAID', 'VOID'],
      PAID: ['REFUNDED'],
      VOID: [],
      REFUNDED: [],
      MERGED: [],
      SPLIT: []
    };

    return (validTransitions[fromState] || []).includes(toState);
  }

  /**
   * Calculates Split Bill by Item
   */
  static calculateItemSplit(billTotal: number, selectedItemsTotal: number) {
    const childGrandTotal = selectedItemsTotal;
    const parentRemainingTotal = billTotal - selectedItemsTotal;

    return {
      childGrandTotal,
      parentRemainingTotal,
    };
  }
}
