-- ========================================================
-- DUCK NOODLE RESTAURANT OS - FULL DATABASE SETUP SCRIPT
-- Run this script directly in Supabase SQL Editor
-- ========================================================

-- >>>>> supabase/migrations/00001_initial_schema.sql >>>>>
-- DUCK NOODLE RESTAURANT OS -- INITIAL SCHEMA
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS uuid_ossp;

CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    logo_url TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'THB',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Bangkok',
    default_language VARCHAR(10) NOT NULL DEFAULT 'th',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_branch_restaurant_code UNIQUE (restaurant_id, code)
);

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_setting_key UNIQUE (restaurant_id, branch_id, key)
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    employee_code VARCHAR(50) NOT NULL,
    pin_code_hash VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'RESIGNED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_employee_code UNIQUE (restaurant_id, branch_id, employee_code)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_restaurant_role UNIQUE (user_id, restaurant_id, branch_id, role_id)
);

CREATE TABLE IF NOT EXISTS employee_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    starting_cash NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (starting_cash >= 0),
    ending_cash NUMERIC(12, 2) CHECK (ending_cash >= 0),
    cash_difference NUMERIC(12, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_drawers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES employee_shifts(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('FLOAT_IN', 'DROP', 'PAYOUT', 'SALE_CASH', 'REFUND_CASH')),
    amount NUMERIC(12, 2) NOT NULL,
    reason TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kitchen_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_station_code UNIQUE (branch_id, code)
);

CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' 
        CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'ORDERING', 'PREPARING', 'READY', 'BILL_REQUESTED', 'PAYING', 'CLOSED')),
    floor VARCHAR(50) DEFAULT '1',
    position_x NUMERIC(8, 2) DEFAULT 0.00,
    position_y NUMERIC(8, 2) DEFAULT 0.00,
    qr_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_branch_table_number UNIQUE (branch_id, table_number)
);

CREATE TABLE IF NOT EXISTS table_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count > 0),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    image_url TEXT,
    base_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (base_price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SOLD_OUT', 'INACTIVE')),
    kitchen_station_id UUID REFERENCES kitchen_stations(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_adjustment NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sku VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    min_selection INTEGER NOT NULL DEFAULT 0 CHECK (min_selection >= 0),
    max_selection INTEGER NOT NULL DEFAULT 1 CHECK (max_selection >= min_selection),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modifier_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_adjustment NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_modifiers (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product_id, modifier_id)
);

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    minimum_stock NUMERIC(12, 4) NOT NULL DEFAULT 0.0000 CHECK (minimum_stock >= 0),
    cost_per_unit NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cost_per_unit >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
    yield_quantity NUMERIC(12, 4) NOT NULL DEFAULT 1.0000 CHECK (yield_quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    tax_id VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'POS' CHECK (source IN ('POS', 'WAITER', 'QR', 'OTHER')),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'CONFIRMED', 'SENT_TO_KITCHEN', 'PREPARING', 'PARTIALLY_READY', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED', 'VOIDED')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_total >= 0),
    tax_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_total >= 0),
    service_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (service_charge >= 0),
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (grand_total >= 0),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    product_name_snapshot VARCHAR(255) NOT NULL,
    unit_price_snapshot NUMERIC(12, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'SENT', 'PREPARING', 'READY', 'SERVED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_name_snapshot VARCHAR(100) NOT NULL,
    option_name_snapshot VARCHAR(100) NOT NULL,
    price_adjustment_snapshot NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    before_snapshot JSONB,
    after_snapshot JSONB,
    reason TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kitchen_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    station_id UUID REFERENCES kitchen_stations(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'PREPARING', 'READY', 'SERVED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ready_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS kitchen_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_order_id UUID NOT NULL REFERENCES kitchen_orders(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kitchen_order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kitchen_order_id UUID NOT NULL REFERENCES kitchen_orders(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    parent_bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
    bill_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' 
        CHECK (status IN ('OPEN', 'PARTIALLY_PAID', 'PAID', 'VOID', 'REFUNDED', 'MERGED', 'SPLIT')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_total >= 0),
    tax_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_total >= 0),
    service_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (service_charge >= 0),
    rounding NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (grand_total >= 0),
    paid_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_total >= 0),
    balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    customer_name VARCHAR(255),
    customer_tax_id VARCHAR(50),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    CONSTRAINT uq_branch_bill_number UNIQUE (branch_id, bill_number)
);

CREATE TABLE IF NOT EXISTS bill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(255) NOT NULL,
    unit_price_snapshot NUMERIC(12, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    modifier_snapshot JSONB,
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bill_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL CHECK (version_number > 0),
    snapshot JSONB NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    change_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bill_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('DISCOUNT', 'SURCHARGE', 'TAX_CHANGE', 'SERVICE_CHARGE', 'ITEM_ADJUSTMENT', 'ROUNDING', 'CORRECTION')),
    amount NUMERIC(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_payment_method_code UNIQUE (restaurant_id, code)
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE RESTRICT,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'REVERSED')),
    reference_number VARCHAR(100),
    idempotency_key VARCHAR(100) UNIQUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    gateway_response JSONB,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('CAPTURE', 'VOID', 'REFUND')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'REJECTED')),
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reversals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    current_stock NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    safety_stock NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_branch_ingredient UNIQUE (branch_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    type VARCHAR(30) NOT NULL CHECK (type IN ('PURCHASE', 'SALE', 'WASTE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RETURN')),
    quantity_delta NUMERIC(12, 4) NOT NULL,
    balance_after NUMERIC(12, 4) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    reason TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    tax_id VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    po_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    total_cost NUMERIC(12, 2) NOT NULL CHECK (total_cost >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goods_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goods_receipt_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity_received NUMERIC(12, 4) NOT NULL CHECK (quantity_received > 0),
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    receipt_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_account_restaurant_code UNIQUE (restaurant_id, code)
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    entry_number VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_type VARCHAR(50) NOT NULL,
    reference_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'POSTED' CHECK (status IN ('DRAFT', 'POSTED', 'REVERSED')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    debit NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (debit >= 0),
    credit NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (credit >= 0),
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    before_snapshot JSONB,
    after_snapshot JSONB,
    reason TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL UNIQUE,
    operation VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    request_hash VARCHAR(64) NOT NULL,
    response_snapshot JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_branches_restaurant ON branches(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_restaurant ON products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_tables_branch ON restaurant_tables(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_branch ON orders(restaurant_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_branch_status ON kitchen_orders(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_bills_restaurant_branch ON bills(restaurant_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_order ON bills(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_bill ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_branch_ingredient ON inventory_transactions(branch_id, ingredient_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_restaurant_date ON journal_entries(restaurant_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_restaurant_action ON audit_logs(restaurant_id, action);



-- >>>>> supabase/migrations/00002_rls_policies.sql >>>>>
-- DUCK NOODLE RESTAURANT OS -- ROW LEVEL SECURITY POLICIES
CREATE OR REPLACE FUNCTION current_restaurant_id() RETURNS UUID AS 
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'restaurant_id', '')::uuid;
 LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_branch_id() RETURNS UUID AS 
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'branch_id', '')::uuid;
 LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION has_permission(required_perm TEXT) RETURNS BOOLEAN AS 
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
      AND ur.restaurant_id = current_restaurant_id()
      AND p.code = required_perm
  );
 LANGUAGE SQL STABLE SECURITY DEFINER;

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_drawers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_restaurants ON restaurants FOR ALL USING (id = current_restaurant_id());
CREATE POLICY tenant_isolation_branches ON branches FOR ALL USING (restaurant_id = current_restaurant_id());
CREATE POLICY tenant_isolation_products ON products FOR ALL USING (restaurant_id = current_restaurant_id());
CREATE POLICY tenant_isolation_orders ON orders FOR ALL USING (restaurant_id = current_restaurant_id() AND (branch_id = current_branch_id() OR current_branch_id() IS NULL));
CREATE POLICY tenant_isolation_bills ON bills FOR ALL USING (restaurant_id = current_restaurant_id() AND (branch_id = current_branch_id() OR current_branch_id() IS NULL));
CREATE POLICY tenant_isolation_tables ON restaurant_tables FOR ALL USING (branch_id = current_branch_id() OR current_branch_id() IS NULL);
CREATE POLICY tenant_isolation_audit ON audit_logs FOR ALL USING (restaurant_id = current_restaurant_id());


-- >>>>> supabase/migrations/00003_triggers_and_functions.sql >>>>>
-- DUCK NOODLE RESTAURANT OS -- TRIGGERS AND STORED PROCEDURES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS 
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_modtime BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_branches_modtime BEFORE UPDATE ON branches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tables_modtime BEFORE UPDATE ON restaurant_tables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bills_modtime BEFORE UPDATE ON bills FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- >>>>> supabase/seed/seed_duck_noodle_restaurant.sql >>>>>
-- DUCK NOODLE RESTAURANT OS -- SEED DATA
-- Fixtures for Duck Noodle Restaurant Multi-Branch System

-- 1. RESTAURANT & BRANCHES
INSERT INTO restaurants (id, name, legal_name, tax_id, phone, email, address, currency, timezone, default_language)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'ร้านก๋วยเตี๋ยวเป็ดนายเอก (Duck Noodle OS Demo)',
    'บริษัท ก๋วยเตี๋ยวเป็ดนายเอก จำกัด',
    '0105562001234',
    '081-234-5678',
    'admin@ducknoodle.os',
    '123 ถนนบรรทัดทอง แขวงวังใหม่ เขตปทุมวัน กรุงเทพมหานคร 10330',
    'THB',
    'Asia/Bangkok',
    'th'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO branches (id, restaurant_id, name, code, phone, address, status)
VALUES 
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'สาขา 1 บรรทัดทอง (Main Branch)',
    'BTH-01',
    '02-123-4567',
    '123 ถนนบรรทัดทอง แขวงวังใหม่ เขตปทุมวัน กรุงเทพฯ',
    'ACTIVE'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'สาขา 2 ลาดพร้าว',
    'LP-02',
    '02-987-6543',
    '888 ถนนลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ',
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- 2. ROLES & PERMISSIONS
INSERT INTO roles (id, restaurant_id, name, code, description, is_system)
VALUES
('r0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'เจ้าของร้าน (Owner)', 'OWNER', 'Full administrative access', TRUE),
('r0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ผู้จัดการร้าน (Manager)', 'MANAGER', 'Branch management, overrides & approvals', TRUE),
('r0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'แคชเชียร์ (Cashier)', 'CASHIER', 'Billing, payments, cash drawer reconciliation', TRUE),
('r0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'พนักงานเสิร์ฟ (Waiter)', 'WAITER', 'Table ordering & guest service', TRUE),
('r0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'พ่อครัว / ครัว (Kitchen)', 'KITCHEN', 'KDS display, cooking & item preparation', TRUE),
('r0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'นักบัญชี (Accountant)', 'ACCOUNTANT', 'Financial reports, journals, ledger audit', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO permissions (id, code, module, description)
VALUES
(gen_random_uuid(), 'dashboard.view', 'dashboard', 'ดูหน้าแดชบอร์ดภาพรวม'),
(gen_random_uuid(), 'orders.create', 'orders', 'สร้างรายการสั่งอาหาร'),
(gen_random_uuid(), 'orders.update', 'orders', 'แก้ไขรายการสั่งอาหาร'),
(gen_random_uuid(), 'orders.cancel', 'orders', 'ยกเลิกออเดอร์ก่อนส่งครัว'),
(gen_random_uuid(), 'orders.void_after_kitchen', 'orders', 'ยกเลิกออเดอร์หลังส่งครัว (ต้องใช้ PIN)'),
(gen_random_uuid(), 'orders.transfer_table', 'orders', 'ย้ายโต๊ะ / รวมโต๊ะ'),
(gen_random_uuid(), 'bills.view', 'billing', 'ดูรายการบิล'),
(gen_random_uuid(), 'bills.create', 'billing', 'เปิดบิลเรียกเก็บเงิน'),
(gen_random_uuid(), 'bills.split_merge', 'billing', 'แยกบิล / รวมบิล'),
(gen_random_uuid(), 'bills.apply_discount', 'billing', 'ให้ส่วนลดพิเศษ'),
(gen_random_uuid(), 'bills.void', 'billing', 'ยกเลิกบิล (ต้องใช้ PIN)'),
(gen_random_uuid(), 'payments.create', 'payment', 'รับชำระเงิน'),
(gen_random_uuid(), 'payments.refund', 'payment', 'คืนเงินลูกค้า'),
(gen_random_uuid(), 'kds.view_manage', 'kitchen', 'ดูและจัดการหน้าจอครัว KDS'),
(gen_random_uuid(), 'inventory.view', 'inventory', 'ดูสต็อกวัตถุดิบ'),
(gen_random_uuid(), 'inventory.adjust_waste', 'inventory', 'บันทึกของเสียและปรับยอดสต็อก'),
(gen_random_uuid(), 'accounting.view_journals', 'accounting', 'ดูสมุดรายวันทั่วไป'),
(gen_random_uuid(), 'accounting.post_adjustments', 'accounting', 'บันทึกรายการปรับปรุงบัญชี'),
(gen_random_uuid(), 'employees.manage', 'employee', 'จัดการพนักงานและกะทำงาน'),
(gen_random_uuid(), 'settings.manage', 'settings', 'ตั้งค่าระบบร้าน')
ON CONFLICT (code) DO NOTHING;

-- 3. KITCHEN STATIONS
INSERT INTO kitchen_stations (id, branch_id, name, code, is_active)
VALUES
('ks000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'สถานีลวกเส้น & ก๋วยเตี๋ยว', 'NOODLE_STATION', TRUE),
('ks000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'สถานีสับเป็ด & ข้าวหน้าเป็ด', 'DUCK_STATION', TRUE),
('ks000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'สถานีต้มซุปเปอร์ & ซุป', 'SOUP_STATION', TRUE),
('ks000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'สถานีเครื่องดื่ม & ของหวาน', 'BAR_STATION', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. RESTAURANT TABLES (T01 - T10)
INSERT INTO restaurant_tables (id, branch_id, table_number, name, capacity, status, floor, qr_token)
VALUES
('t0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'T01', 'โต๊ะ 1 (หน้าร้าน)', 4, 'AVAILABLE', '1', 'q0000000-0000-0000-0000-000000000001'),
('t0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'T02', 'โต๊ะ 2 (หน้าร้าน)', 4, 'AVAILABLE', '1', 'q0000000-0000-0000-0000-000000000002'),
('t0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'T03', 'โต๊ะ 3 (กลางร้าน)', 4, 'AVAILABLE', '1', 'q0000000-0000-0000-0000-000000000003'),
('t0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'T04', 'โต๊ะ 4 (กลางร้าน)', 4, 'AVAILABLE', '1', 'q0000000-0000-0000-0000-000000000004'),
('t0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'T05', 'โต๊ะ 5 (ติดแอร์)', 6, 'AVAILABLE', '1', 'q0000000-0000-0000-0000-000000000005'),
('t0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'T06', 'โต๊ะ 6 (ติดแอร์)', 6, 'AVAILABLE', '1', 'q0000000-0000-0000-0000-000000000006'),
('t0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'T07', 'โต๊ะ 7 (VIP)', 8, 'AVAILABLE', '2', 'q0000000-0000-0000-0000-000000000007'),
('t0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'T08', 'โต๊ะ 8 (VIP)', 8, 'AVAILABLE', '2', 'q0000000-0000-0000-0000-000000000008')
ON CONFLICT (id) DO NOTHING;

-- 5. MENU CATEGORIES & PRODUCTS
INSERT INTO categories (id, restaurant_id, name, description, sort_order)
VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ก๋วยเตี๋ยว & บะหมี่เป็ด', 'เมนูก๋วยเตี๋ยวเป็ดพะโล้และเป็ดย่างสูตรเด็ด', 1),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ข้าว & จานเดียว', 'ข้าวหน้าเป็ด ข้าวเฉโป', 2),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'เป็ดจานเดี่ยว & ต้มซุป', 'เป็ดย่างจาน เป็ดพะโล้ ต้มซุปเปอร์', 3),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'เครื่องดื่มสมุนไพร & น้ำ', 'ชาดำเย็น เก๊กฮวย โอเลี้ยง', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, restaurant_id, category_id, name, description, sku, base_price, cost_price, status, kitchen_station_id, sort_order)
VALUES
('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ก๋วยเตี๋ยวเป็ดพะโล้', 'เนื้อเป็ดนุ่ม ชุ่มน้ำพะโล้หอมเครื่องเทศยาจีน', 'DUCK-NDL-01', 65.00, 26.00, 'ACTIVE', 'ks000000-0000-0000-0000-000000000001', 1),
('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'บะหมี่หยกเป็ดย่างฮ่องกง', 'บะหมี่หยกเหนียวนุ่ม เป็ดย่างหนังกรอบ ราดซอสหวานกลมกล่อม', 'DUCK-NDL-02', 80.00, 32.00, 'ACTIVE', 'ks000000-0000-0000-0000-000000000001', 2),
('p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ก๋วยเตี๋ยวเป็ดตุ๋นเห็ดหอม', 'เป็ดตุ๋นเปื่อยละลายในปาก เห็ดหอมคัดพิเศษ', 'DUCK-NDL-03', 85.00, 35.00, 'ACTIVE', 'ks000000-0000-0000-0000-000000000001', 3),
('p0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'ข้าวหน้าเป็ดย่างโบราณ', 'ข้าวหอมมะลิร้อนๆ โปะเป็ดย่างพร้อมน้ำราดรสเด็ดและขิงดอง', 'DUCK-RICE-01', 75.00, 28.00, 'ACTIVE', 'ks000000-0000-0000-0000-000000000002', 4),
('p0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'เป็ดย่างจานใหญ่ (ครึ่งตัว)', 'เป็ดย่างสูตรฮ่องกง หนังกรอบเนื้อนุ่ม เสิร์ฟพร้อมน้ำราดและพริกดอง', 'DUCK-DISH-01', 280.00, 110.00, 'ACTIVE', 'ks000000-0000-0000-0000-000000000002', 5),
('p0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'ต้มซุปเปอร์ปีกขาเป็ดหม้อไฟ', 'รสแซ่บจัดจ้าน เปรี้ยว เผ็ด กลมกล่อม ปีกขาเป็ดเปื่อยนุ่ม', 'DUCK-SOUP-01', 150.00, 50.00, 'ACTIVE', 'ks000000-0000-0000-0000-000000000003', 6),
('p0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'ชาดำเย็นโบราณ', 'ชาไทยหอมเข้มข้น หวานชื่นใจ', 'BEV-01', 25.00, 6.00, 'ACTIVE', 'ks000000-0000-0000-0000-000000000004', 7),
('p0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'น้ำเก๊กฮวยดอกแท้', 'เก๊กฮวยต้มสด หวานน้อย แก้ร้อนใน', 'BEV-02', 25.00, 6.00, 'ACTIVE', 'ks000000-0000-0000-0000-000000000004', 8)
ON CONFLICT (id) DO NOTHING;

-- 6. MODIFIERS & OPTIONS
INSERT INTO modifiers (id, restaurant_id, name, required, min_selection, max_selection)
VALUES
('m0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'เลือกชนิดเส้น', TRUE, 1, 1),
('m0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ระดับความพิเศษ', FALSE, 0, 1),
('m0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'ระดับความเผ็ด', FALSE, 0, 1),
('m0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'เพิ่มเครื่อง / ท็อปปิ้ง', FALSE, 0, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO modifier_options (id, modifier_id, name, price_adjustment, is_default, sort_order)
VALUES
-- เส้น
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000001', 'เส้นเล็ก', 0.00, TRUE, 1),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000001', 'เส้นใหญ่', 0.00, FALSE, 2),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000001', 'บะหมี่ไข่เหลือง', 0.00, FALSE, 3),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000001', 'บะหมี่หยก', 5.00, FALSE, 4),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000001', 'เส้นหมี่ขาว', 0.00, FALSE, 5),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000001', 'เกาเหลา (ไม่เอาเส้น)', 0.00, FALSE, 6),
-- ความพิเศษ
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000002', 'ธรรมดา', 0.00, TRUE, 1),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000002', 'พิเศษ (+15฿)', 15.00, FALSE, 2),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000002', 'จัมโบ้ / เพิ่มเส้นและเนื้อ (+30฿)', 30.00, FALSE, 3),
-- ความเผ็ด
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000003', 'ไม่เผ็ด (ไม่ใส่พริก)', 0.00, FALSE, 1),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000003', 'เผ็ดน้อย', 0.00, FALSE, 2),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000003', 'เผ็ดปกติ', 0.00, TRUE, 3),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000003', 'เผ็ดมาก (พริกคั่วพิเศษ)', 0.00, FALSE, 4),
-- ท็อปปิ้ง
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000004', 'เพิ่มเนื้อเป็ดพะโล้ (+25฿)', 25.00, FALSE, 1),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000004', 'เพิ่มเลือดเป็ดนุ่ม (+10฿)', 10.00, FALSE, 2),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000004', 'เพิ่มไข่ต้มยางมะตูม (+10฿)', 10.00, FALSE, 3),
(gen_random_uuid(), 'm0000000-0000-0000-0000-000000000004', 'เพิ่มไส้แก้วกรุบกรอบ (+25฿)', 25.00, FALSE, 4);

-- ผูก Modifier กับ Product
INSERT INTO product_modifiers (product_id, modifier_id)
VALUES
('p0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001'),
('p0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000002'),
('p0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000003'),
('p0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000004'),
('p0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000002'),
('p0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- 7. PAYMENT METHODS
INSERT INTO payment_methods (id, restaurant_id, code, name, is_active)
VALUES
('pm000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'CASH', 'เงินสด (Cash)', TRUE),
('pm000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'PROMPTPAY', 'Thai QR PromptPay', TRUE),
('pm000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'CREDIT_CARD', 'บัตรเครดิต / เดบิต (EDC)', TRUE),
('pm000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'TRANSFER', 'โอนเงินผ่านธนาคาร', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 8. CHART OF ACCOUNTS (DOUBLE-ENTRY)
INSERT INTO accounts (id, restaurant_id, code, name, type, is_active)
VALUES
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '1001', 'เงินสดในมือ (Cash on Hand)', 'ASSET', TRUE),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '1002', 'เงินฝากธนาคาร PromptPay (Bank Account)', 'ASSET', TRUE),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '1201', 'สต็อกวัตถุดิบเป็ดและเนื้อสัตว์ (Duck Inventory)', 'ASSET', TRUE),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '1202', 'สต็อกเส้นและของแห้ง (Noodle & Dry Stock)', 'ASSET', TRUE),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '2001', 'ภาษีขายรอนำส่ง (VAT Payable 7%)', 'LIABILITY', TRUE),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '4001', 'รายได้จากการขายอาหาร (Food Revenue)', 'REVENUE', TRUE),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '4002', 'รายได้จากการขายเครื่องดื่ม (Beverage Revenue)', 'REVENUE', TRUE),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '5001', 'ต้นทุนขาย - เนื้อเป็ดและวัตถุดิบ (COGS Duck)', 'EXPENSE', TRUE),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '5002', 'ต้นทุนขาย - เส้นและเครื่องปรุง (COGS Noodles)', 'EXPENSE', TRUE),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '6001', 'เงินเดือนและค่าจ้างพนักงาน (Staff Salary)', 'EXPENSE', TRUE),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', '6002', 'ค่าเช่าร้านและสาธารณูปโภค (Rent & Utilities)', 'EXPENSE', TRUE)
ON CONFLICT DO NOTHING;


