import { Database, OrderStatus, BillStatus, PaymentStatus, TableStatus } from './database.types';

export interface ModifierOptionSelection {
  modifier_id: string;
  modifier_name: string;
  option_id: string;
  option_name: string;
  price_adjustment: number;
}

export interface CreateOrderItemInput {
  product_id: string;
  quantity: number;
  modifiers?: ModifierOptionSelection[];
  notes?: string;
}

export interface CreateOrderRequest {
  restaurant_id: string;
  branch_id: string;
  table_id?: string;
  source: 'POS' | 'WAITER' | 'QR';
  items: CreateOrderItemInput[];
  notes?: string;
}

export interface ProcessPaymentInput {
  bill_id: string;
  payment_method_id: string;
  amount: number;
  reference_number?: string;
  idempotency_key: string;
}

export interface SplitBillInput {
  bill_id: string;
  split_type: 'BY_ITEM' | 'BY_AMOUNT';
  items_split?: {
    order_item_id: string;
    quantity: number;
  }[];
  amounts_split?: number[];
}
