export class PaymentDomainService {
  /**
   * Verifies outstanding balance and tender amount
   */
  static validateSettlement(balanceDue: number, tenderAmount: number) {
    if (tenderAmount <= 0) {
      throw new Error('ยอดชำระต้องมากกว่า 0 บาท');
    }
    if (tenderAmount > balanceDue) {
      // Overpayment generates change in Cash mode
      return {
        settledAmount: balanceDue,
        changeDue: tenderAmount - balanceDue,
        isFullyPaid: true,
      };
    }
    const remainingBalance = balanceDue - tenderAmount;
    return {
      settledAmount: tenderAmount,
      changeDue: 0,
      isFullyPaid: remainingBalance === 0,
    };
  }
}
