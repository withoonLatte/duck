export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'ORDERING' | 'PREPARING' | 'READY' | 'BILL_REQUESTED' | 'PAYING' | 'CLOSED';
export type OrderSource = 'POS' | 'WAITER' | 'QR' | 'OTHER';
export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'SENT_TO_KITCHEN' | 'PREPARING' | 'PARTIALLY_READY' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED' | 'VOIDED';
export type OrderItemStatus = 'PENDING' | 'SENT' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
export type BillStatus = 'OPEN' | 'PARTIALLY_PAID' | 'PAID' | 'VOID' | 'REFUNDED' | 'MERGED' | 'SPLIT';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'REVERSED';
export type RoleCode = 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN' | 'ACCOUNTANT';

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          tax_id: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          logo_url: string | null;
          currency: string;
          timezone: string;
          default_language: string;
          created_at: string;
          updated_at: string;
        };
      };
      branches: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          code: string;
          phone: string | null;
          address: string | null;
          status: 'ACTIVE' | 'INACTIVE';
          created_at: string;
          updated_at: string;
        };
      };
      restaurant_tables: {
        Row: {
          id: string;
          branch_id: string;
          table_number: string;
          name: string | null;
          capacity: number;
          status: TableStatus;
          floor: string | null;
          position_x: number;
          position_y: number;
          qr_token: string;
          created_at: string;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description: string | null;
          sku: string | null;
          image_url: string | null;
          base_price: number;
          cost_price: number;
          status: 'ACTIVE' | 'SOLD_OUT' | 'INACTIVE';
          kitchen_station_id: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          restaurant_id: string;
          branch_id: string;
          table_id: string | null;
          session_id: string | null;
          customer_id: string | null;
          order_number: string;
          source: OrderSource;
          status: OrderStatus;
          subtotal: number;
          discount_total: number;
          tax_total: number;
          service_charge: number;
          grand_total: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          cancelled_at: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          discount_amount: number;
          tax_amount: number;
          line_total: number;
          notes: string | null;
          status: OrderItemStatus;
          created_at: string;
          updated_at: string;
        };
      };
      bills: {
        Row: {
          id: string;
          restaurant_id: string;
          branch_id: string;
          order_id: string | null;
          parent_bill_id: string | null;
          bill_number: string;
          status: BillStatus;
          subtotal: number;
          discount_total: number;
          tax_total: number;
          service_charge: number;
          rounding: number;
          grand_total: number;
          paid_total: number;
          balance_due: number;
          customer_name: string | null;
          customer_tax_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          bill_id: string;
          payment_method_id: string;
          amount: number;
          status: PaymentStatus;
          reference_number: string | null;
          idempotency_key: string | null;
          created_by: string | null;
          created_at: string;
          completed_at: string | null;
        };
      };
    };
  };
}
