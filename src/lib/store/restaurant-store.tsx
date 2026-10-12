'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FIXTURE_RESTAURANT,
  FIXTURE_TABLES,
  FIXTURE_PRODUCTS,
  FIXTURE_MODIFIERS,
  FIXTURE_INGREDIENTS,
  FIXTURE_RECIPES,
  FixtureProduct,
  FixtureTable,
  FixtureIngredient,
  FixtureRecipe,
} from './fixtures';

export type RoleType = 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN' | 'ACCOUNTANT';

export function checkRoleRoutePermission(role: RoleType, pathname: string): boolean {
  if (pathname.startsWith('/order')) return true; // Customer QR order is public
  if (role === 'OWNER') return true; // All menus 100%
  if (role === 'MANAGER') return !pathname.startsWith('/settings'); // All menus except settings
  if (role === 'CASHIER') return !pathname.startsWith('/settings'); // All menus except settings
  if (role === 'WAITER') return pathname.startsWith('/pos'); // POS only
  if (role === 'KITCHEN') return pathname.startsWith('/kds'); // Kitchen only
  return false;
}

export interface OrderItemModifierOption {
  groupName: string;
  optionName: string;
  price: number;
}

export interface StoreOrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  modifiers: OrderItemModifierOption[];
  modifierTotal: number;
  lineTotal: number;
  station: string;
  notes?: string;
  status: 'PENDING' | 'SENT' | 'PREPARING' | 'READY' | 'SERVED';
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  guestCount: number;
  items: StoreOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  source?: 'POS' | 'WAITER' | 'CUSTOMER_QR';
  approvalStatus?: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';
  customerName?: string;
  status: 'DRAFT' | 'CONFIRMED' | 'SENT_TO_KITCHEN' | 'PREPARING' | 'PARTIALLY_READY' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface StoreKDSTicket {
  id: string;
  orderId: string;
  tableNumber: string;
  createdAt: string;
  station: string;
  status: 'NEW' | 'PREPARING' | 'READY';
  items: {
    id: string;
    orderItemId: string;
    productName: string;
    quantity: number;
    modifiers: string[];
    notes?: string;
    isReady: boolean;
  }[];
}

export interface StoreBill {
  id: string;
  billNumber: string;
  orderId?: string;
  tableNumber?: string;
  parentBillId?: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  serviceCharge: number;
  grandTotal: number;
  paidTotal: number;
  balanceDue: number;
  status: 'OPEN' | 'PARTIALLY_PAID' | 'PAID' | 'VOID' | 'REFUNDED' | 'SPLIT' | 'MERGED';
  items: {
    id: string;
    productName: string;
    quantity: number;
    lineTotal: number;
    modifiers: string[];
  }[];
  createdAt: string;
}

export interface StorePayment {
  id: string;
  billId: string;
  method: 'CASH' | 'PROMPTPAY' | 'CREDIT_CARD';
  amount: number;
  tenderAmount?: number;
  changeDue?: number;
  referenceNumber: string;
  status: 'COMPLETED' | 'REFUNDED';
  createdAt: string;
}

export interface StoreJournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  reference: string;
  description: string;
  lines: {
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
  }[];
}

export interface StoreAuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  role: RoleType;
  entityType: string;
  entityId: string;
  details: string;
  photoUrl?: string;
  signatureUrl?: string;
  reason?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: RoleType;
  pin: string;
  phone?: string;
  isActive: boolean;
}

export interface StoreRestaurantSettings {
  name: string;
  branchName: string;
  taxId: string;
  phone: string;
  address: string;
  receiptHeader: string;
  receiptFooter: string;
  logoUrl: string;
  promptPayId: string;
  promptPayQrUrl?: string;
  wifiSsid: string;
  wifiPassword: string;
  vatRate: number;
  serviceChargeRate: number;
  enableVat: boolean;
  enableServiceCharge: boolean;
}

interface RestaurantContextType {
  activeRole: RoleType;
  setActiveRole: (role: RoleType) => void;
  restaurantSettings: StoreRestaurantSettings;
  updateRestaurantSettings: (newSettings: Partial<StoreRestaurantSettings>) => void;
  tables: (FixtureTable & { status: string; currentOrderId?: string; guestCount?: number })[];
  orders: StoreOrder[];
  kdsTickets: StoreKDSTicket[];
  bills: StoreBill[];
  payments: StorePayment[];
  products: FixtureProduct[];
  ingredients: FixtureIngredient[];
  recipes: FixtureRecipe[];
  staffMembers: StaffMember[];
  currentStaff: StaffMember | null;
  isAuthenticated: boolean;
  logoutStaff: () => void;
  journalEntries: StoreJournalEntry[];
  
  voidOrderItemWithEvidence: (
    tableId: string, 
    itemId: string, 
    evidence: { reason: string; photoUrl?: string; signatureUrl: string; managerName: string; pin: string }
  ) => { success: boolean; error?: string };

  // Staff & PIN Actions
  addStaffMember: (staff: Omit<StaffMember, 'id'>) => void;
  updateStaffMember: (id: string, updated: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;
  switchStaffByPin: (pin: string) => { success: boolean; staff?: StaffMember; error?: string };
  auditLogs: StoreAuditLog[];
  
  // Menu & Ingredient & Recipe Actions
  addProduct: (product: Omit<FixtureProduct, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<FixtureProduct>) => void;
  deleteProduct: (id: string) => void;
  addIngredient: (ingredient: Omit<FixtureIngredient, 'id'>) => void;
  updateIngredient: (id: string, updated: Partial<FixtureIngredient>) => void;
  deleteIngredient: (id: string) => void;
  updateRecipe: (productId: string, items: { ingredientId: string; ingredientName: string; quantity: number; unit: string }[]) => void;
  
  // Actions
  openTable: (tableId: string, guestCount: number) => string;
  addOrderItem: (tableId: string, product: FixtureProduct, quantity: number, modifiers: OrderItemModifierOption[], notes?: string) => void;
  updateOrderItemQty: (tableId: string, itemId: string, delta: number) => void;
  removeOrderItem: (tableId: string, itemId: string) => void;
  sendOrderToKitchen: (tableId: string) => void;
  bumpKDSItem: (ticketId: string, itemId: string) => void;
  bumpKDSTicket: (ticketId: string) => void;
  recallKDSTicket: (ticketId: string) => void;
  generateBill: (tableId: string) => string;
  splitBillByItem: (billId: string, itemIds: string[]) => { newBillId: string };
  splitBillByAmount: (billId: string, partsCount: number) => void;
  mergeBills: (sourceBillId: string, targetBillId: string) => void;
  applyDiscount: (billId: string, discountAmount: number, reason: string) => void;
  processPayment: (billId: string, method: 'CASH' | 'PROMPTPAY' | 'CREDIT_CARD', amount: number, tenderAmount?: number) => { success: boolean; changeDue: number; paymentId: string };
  processRefund: (paymentId: string, reason: string, pin: string) => { success: boolean; error?: string };
  adjustStock: (ingredientId: string, delta: number, reason: string) => void;
  recordWaste: (ingredientId: string, quantity: number, reason: string) => void;
  submitQROrder: (tableNumber: string, items: Array<{ product: FixtureProduct; quantity: number; modifiers: OrderItemModifierOption[]; notes?: string }>, customerName?: string) => string;
  approveQROrder: (orderId: string) => void;
  rejectQROrder: (orderId: string, reason: string) => void;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<RoleType>('OWNER');

  const [restaurantSettings, setRestaurantSettings] = useState<StoreRestaurantSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('duck_os_restaurant_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      name: 'เตี๋ยวเป็ด (Duck Noodle OS)',
      branchName: 'สาขา 1 บรรทัดทอง',
      taxId: '0105562001234',
      phone: '081-234-5678',
      address: '123 ถนนบรรทัดทอง แขวงวังใหม่ เขตปทุมวัน กรุงเทพมหานคร 10330',
      receiptHeader: 'ขอบพระคุณที่อุดหนุน เตี๋ยวเป็ด (ESTABLISHED IN 1990)',
      receiptFooter: 'อาหารอร่อย สด สะอาด บริการด้วยใจ',
      logoUrl: '/logo.png',
      promptPayId: '0812345678',
      promptPayQrUrl: '',
      wifiSsid: 'DuckNoodle_5G',
      wifiPassword: '88888888',
      vatRate: 7,
      serviceChargeRate: 0,
      enableVat: true,
      enableServiceCharge: false,
    };
  });

  const updateRestaurantSettings = (newSettings: Partial<StoreRestaurantSettings>) => {
    setRestaurantSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('duck_os_restaurant_settings', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Initial State from Fixtures
  const [tables, setTables] = useState<(FixtureTable & { status: string; currentOrderId?: string; guestCount?: number })[]>(() =>
    FIXTURE_TABLES.map((t, idx) => ({
      ...t,
      status: idx === 0 ? 'OCCUPIED' : 'AVAILABLE',
      guestCount: idx === 0 ? 2 : 0,
      currentOrderId: idx === 0 ? 'ord-demo-01' : undefined,
    }))
  );

  const [orders, setOrders] = useState<StoreOrder[]>([
    {
      id: 'ord-demo-01',
      orderNumber: 'ORD-1001',
      tableId: 't-01',
      tableNumber: 'T01',
      guestCount: 2,
      status: 'SENT_TO_KITCHEN',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60000).toISOString(),
      subtotal: 185,
      discountTotal: 0,
      taxTotal: 12.95,
      grandTotal: 197.95,
      items: [
        {
          id: 'item-demo-1',
          productId: 'p-01',
          productName: 'ก๋วยเตี๋ยวเป็ดพะโล้',
          unitPrice: 65,
          quantity: 1,
          modifiers: [
            { groupName: 'เลือกเส้น', optionName: 'บะหมี่หยก', price: 5 },
            { groupName: 'ความพิเศษ', optionName: 'พิเศษ (+15฿)', price: 15 },
            { groupName: 'ความเผ็ด', optionName: 'เผ็ดปกติ', price: 0 },
            { groupName: 'เพิ่มท็อปปิ้ง', optionName: 'เพิ่มเนื้อเป็ดพะโล้ (+25฿)', price: 25 },
          ],
          modifierTotal: 45,
          lineTotal: 110,
          station: 'NOODLE_STATION',
          notes: 'ไม่ใส่ถั่วงอก',
          status: 'PREPARING',
        },
        {
          id: 'item-demo-2',
          productId: 'p-07',
          productName: 'ชาดำเย็นโบราณ',
          unitPrice: 25,
          quantity: 2,
          modifiers: [],
          modifierTotal: 0,
          lineTotal: 50,
          station: 'BAR_STATION',
          status: 'READY',
        },
        {
          id: 'item-demo-3',
          productId: 'p-08',
          productName: 'น้ำเก๊กฮวยดอกแท้',
          unitPrice: 25,
          quantity: 1,
          modifiers: [],
          modifierTotal: 0,
          lineTotal: 25,
          station: 'BAR_STATION',
          status: 'READY',
        },
      ],
    },
  ]);

  const [kdsTickets, setKdsTickets] = useState<StoreKDSTicket[]>([
    {
      id: 'kds-01',
      orderId: 'ord-demo-01',
      tableNumber: 'T01',
      station: 'NOODLE_STATION',
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      status: 'PREPARING',
      items: [
        {
          id: 'kds-item-1',
          orderItemId: 'item-demo-1',
          productName: 'ก๋วยเตี๋ยวเป็ดพะโล้',
          quantity: 1,
          modifiers: ['บะหมี่หยก (+5฿)', 'พิเศษ (+15฿)', 'เผ็ดปกติ', 'เพิ่มเนื้อเป็ด (+25฿)'],
          notes: 'ไม่ใส่ถั่วงอก',
          isReady: false,
        },
      ],
    },
    {
      id: 'kds-02',
      orderId: 'ord-demo-01',
      tableNumber: 'T01',
      station: 'BAR_STATION',
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      status: 'READY',
      items: [
        {
          id: 'kds-item-2',
          orderItemId: 'item-demo-2',
          productName: 'ชาดำเย็นโบราณ',
          quantity: 2,
          modifiers: [],
          isReady: true,
        },
        {
          id: 'kds-item-3',
          orderItemId: 'item-demo-3',
          productName: 'น้ำเก๊กฮวยดอกแท้',
          quantity: 1,
          modifiers: [],
          isReady: true,
        },
      ],
    },
  ]);

  const [bills, setBills] = useState<StoreBill[]>([]);
  const [payments, setPayments] = useState<StorePayment[]>([]);
  const [products, setProducts] = useState<FixtureProduct[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('duck_os_products');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return FIXTURE_PRODUCTS;
  });

  const [ingredients, setIngredients] = useState<FixtureIngredient[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('duck_os_ingredients');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return FIXTURE_INGREDIENTS;
  });

  const [recipes, setRecipes] = useState<FixtureRecipe[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('duck_os_recipes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return FIXTURE_RECIPES;
  });

  const DEFAULT_STAFF: StaffMember[] = [
    { id: 'staff-01', name: 'คุณวิทย์ (เจ้าของร้าน)', role: 'OWNER', pin: '8888', phone: '081-234-5678', isActive: true },
    { id: 'staff-02', name: 'สมชาย (ผู้จัดการร้าน)', role: 'MANAGER', pin: '1234', phone: '089-999-8888', isActive: true },
    { id: 'staff-03', name: 'น้องส้ม (แคชเชียร์ 1)', role: 'CASHIER', pin: '1111', phone: '082-111-2222', isActive: true },
    { id: 'staff-04', name: 'น้องก้อง (พนักงานเสิร์ฟ)', role: 'WAITER', pin: '2222', phone: '083-333-4444', isActive: true },
    { id: 'staff-05', name: 'เชฟเอก (หัวหน้าครัว)', role: 'KITCHEN', pin: '3333', phone: '084-555-6666', isActive: true },
  ];

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('duck_os_staff_members');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_STAFF;
  });

  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(() => {
    if (typeof window !== 'undefined') {
      const savedId = sessionStorage.getItem('duck_os_active_staff_id');
      if (savedId) {
        const found = staffMembers.find((s) => s.id === savedId);
        if (found) return found;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!sessionStorage.getItem('duck_os_active_staff_id');
    }
    return false;
  });

  const logoutStaff = () => {
    setCurrentStaff(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('duck_os_active_staff_id');
    }
    logAudit('STAFF_LOGOUT', 'STAFF', currentStaff?.id || 'unknown', `ล็อกหน้าจอ / ออกจากระบบ`);
  };

  // Staff CRUD & PIN Authentication
  const addStaffMember = (staff: Omit<StaffMember, 'id'>) => {
    const newId = 'staff-' + Date.now();
    const newStaff: StaffMember = { ...staff, id: newId };
    setStaffMembers((prev) => {
      const next = [...prev, newStaff];
      if (typeof window !== 'undefined') localStorage.setItem('duck_os_staff_members', JSON.stringify(next));
      return next;
    });
    logAudit('CREATE_STAFF', 'STAFF', newId, `เพิ่มพนักงานใหม่: ${newStaff.name} (${newStaff.role})`);
  };

  const updateStaffMember = (id: string, updated: Partial<StaffMember>) => {
    setStaffMembers((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updated } : s));
      if (typeof window !== 'undefined') localStorage.setItem('duck_os_staff_members', JSON.stringify(next));
      return next;
    });
    logAudit('UPDATE_STAFF', 'STAFF', id, `แก้ไขข้อมูลพนักงาน ${id}`);
  };

  const deleteStaffMember = (id: string) => {
    setStaffMembers((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (typeof window !== 'undefined') localStorage.setItem('duck_os_staff_members', JSON.stringify(next));
      return next;
    });
    logAudit('DELETE_STAFF', 'STAFF', id, `ลบพนักงาน ${id}`);
  };

  const switchStaffByPin = (pin: string) => {
    const found = staffMembers.find((s) => s.pin === pin && s.isActive);
    if (found) {
      setCurrentStaff(found);
      setActiveRole(found.role);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('duck_os_active_staff_id', found.id);
      }
      logAudit('STAFF_LOGIN_PIN', 'STAFF', found.id, `พนักงาน ${found.name} (${found.role}) ปลดล็อกหน้าจอด้วย PIN`);
      return { success: true, staff: found };
    }
    return { success: false, error: 'รหัส PIN 4 หลักไม่ถูกต้อง' };
  };

  // Product CRUD
  const addProduct = (prod: Omit<FixtureProduct, 'id'>) => {
    const newId = 'p-' + Date.now();
    const newProd: FixtureProduct = { ...prod, id: newId };
    setProducts((prev) => {
      const next = [...prev, newProd];
      if (typeof window !== 'undefined') localStorage.setItem('duck_os_products', JSON.stringify(next));
      return next;
    });
    logAudit('CREATE_PRODUCT', 'PRODUCT', newId, `เพิ่มเมนูใหม่: ${newProd.name} (฿${newProd.price})`);
  };

  const updateProduct = (id: string, updated: Partial<FixtureProduct>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      if (typeof window !== 'undefined') localStorage.setItem('duck_os_products', JSON.stringify(next));
      return next;
    });
    logAudit('UPDATE_PRODUCT', 'PRODUCT', id, `แก้ไขข้อมูลเมนู ${id}`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (typeof window !== 'undefined') localStorage.setItem('duck_os_products', JSON.stringify(next));
      return next;
    });
    logAudit('DELETE_PRODUCT', 'PRODUCT', id, `ลบเมนู ${id}`);
  };

  // Ingredient CRUD
  const addIngredient = (ing: Omit<FixtureIngredient, 'id'>) => {
    const newId = 'ing-' + Date.now();
    const newIng: FixtureIngredient = { ...ing, id: newId };
    setIngredients((prev) => {
      const next = [...prev, newIng];
      if (typeof window !== 'undefined') localStorage.setItem('duck_os_ingredients', JSON.stringify(next));
      return next;
    });
    logAudit('CREATE_INGREDIENT', 'INGREDIENT', newId, `เพิ่มวัตถุดิบใหม่: ${newIng.name} (${newIng.unit})`);
  };

  const updateIngredient = (id: string, updated: Partial<FixtureIngredient>) => {
    setIngredients((prev) => {
      const next = prev.map((ing) => (ing.id === id ? { ...ing, ...updated } : ing));
      if (typeof window !== 'undefined') localStorage.setItem('duck_os_ingredients', JSON.stringify(next));
      return next;
    });
    logAudit('UPDATE_INGREDIENT', 'INGREDIENT', id, `แก้ไขวัตถุดิบ ${id}`);
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => {
      const next = prev.filter((ing) => ing.id !== id);
      if (typeof window !== 'undefined') localStorage.setItem('duck_os_ingredients', JSON.stringify(next));
      return next;
    });
    logAudit('DELETE_INGREDIENT', 'INGREDIENT', id, `ลบวัตถุดิบ ${id}`);
  };

  // Recipe BOM update
  const updateRecipe = (productId: string, items: { ingredientId: string; ingredientName: string; quantity: number; unit: string }[]) => {
    const targetProduct = products.find((p) => p.id === productId);
    const prodName = targetProduct ? targetProduct.name : productId;
    setRecipes((prev) => {
      const existing = prev.find((r) => r.productId === productId);
      let next: FixtureRecipe[];
      if (existing) {
        next = prev.map((r) => (r.productId === productId ? { ...r, items } : r));
      } else {
        next = [...prev, { productId, productName: prodName, items }];
      }
      if (typeof window !== 'undefined') localStorage.setItem('duck_os_recipes', JSON.stringify(next));
      return next;
    });
    logAudit('UPDATE_RECIPE', 'RECIPE', productId, `แก้ไขสูตรอาหาร BOM สำหรับ ${prodName}`);
  };

  const [journalEntries, setJournalEntries] = useState<StoreJournalEntry[]>([
    {
      id: 'je-001',
      entryNumber: 'JE-2026-001',
      date: new Date().toISOString().split('T')[0],
      reference: 'INITIAL_CAPITAL',
      description: 'เงินสดยกมาเริ่มต้นกะเปิดร้าน',
      lines: [
        { accountCode: '1001', accountName: 'เงินสดในมือ (Cash on Hand)', debit: 5000, credit: 0 },
        { accountCode: '1002', accountName: 'เงินฝากธนาคาร PromptPay', debit: 20000, credit: 0 },
        { accountCode: '3001', accountName: 'ทุนเจ้าของร้าน (Owner Equity)', debit: 0, credit: 25000 },
      ],
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<StoreAuditLog[]>([
    {
      id: 'aud-001',
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      action: 'SHIFT_OPENED',
      actor: 'สมชาย (ผู้จัดการ)',
      role: 'MANAGER',
      entityType: 'SHIFT',
      entityId: 'shift-01',
      details: 'เปิดกะขายเช้าพร้อมเงินทอน 5,000.00 บาท',
    },
  ]);

  // Log Helper with Real Active Staff Actor
  const logAudit = (action: string, entityType: string, entityId: string, details: string) => {
    const actorName = currentStaff ? currentStaff.name : (activeRole === 'OWNER' ? 'คุณวิทย์ (เจ้าของ)' : 'พนักงาน (' + activeRole + ')');
    const newLog: StoreAuditLog = {
      id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      action,
      actor: actorName,
      role: currentStaff ? currentStaff.role : activeRole,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 1. OPEN TABLE
  const openTable = (tableId: string, guestCount: number): string => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return '';

    const newOrderId = 'ord-' + Date.now();
    const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: StoreOrder = {
      id: newOrderId,
      orderNumber,
      tableId,
      tableNumber: table.number,
      guestCount,
      items: [],
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [...prev, newOrder]);
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: 'OCCUPIED', guestCount, currentOrderId: newOrderId } : t))
    );

    logAudit('TABLE_OPEN', 'TABLE', tableId, 'เปิดโต๊ะ ' + table.number + ' จำนวน ' + guestCount + ' ท่าน (Order: ' + orderNumber + ')');
    return newOrderId;
  };

  // 2. ADD ORDER ITEM (ATOMIC & RELIABLE ON MOBILE & DESKTOP)
  const addOrderItem = (tableId: string, product: FixtureProduct, quantity: number, modifiers: OrderItemModifierOption[], notes?: string) => {
    const table = tables.find((t) => t.id === tableId || t.number === tableId);
    const resolvedTableId = table ? table.id : tableId;
    const resolvedTableNumber = table ? table.number : tableId;

    const modifierTotal = modifiers.reduce((sum, m) => sum + m.price, 0);
    const lineTotal = (product.price + modifierTotal) * quantity;

    const newItem: StoreOrderItem = {
      id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity,
      modifiers,
      modifierTotal,
      lineTotal,
      station: product.station,
      notes,
      status: 'PENDING',
    };

    let createdOrderId = '';

    setOrders((prev) => {
      const existingOrderIndex = prev.findIndex(
        (o) => (o.tableId === resolvedTableId || o.tableNumber === resolvedTableNumber) && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
      );

      if (existingOrderIndex >= 0) {
        const ord = prev[existingOrderIndex];
        const updatedItems = [...ord.items, newItem];
        const subtotal = updatedItems.reduce((s, i) => s + i.lineTotal, 0);
        const taxTotal = Math.round(subtotal * 0.07 * 100) / 100;
        const updatedOrder = {
          ...ord,
          items: updatedItems,
          subtotal,
          taxTotal,
          grandTotal: subtotal + taxTotal,
          updatedAt: new Date().toISOString(),
        };
        const next = [...prev];
        next[existingOrderIndex] = updatedOrder;
        return next;
      } else {
        const newOrderId = 'ord-' + Date.now();
        createdOrderId = newOrderId;
        const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        const subtotal = lineTotal;
        const taxTotal = Math.round(subtotal * 0.07 * 100) / 100;
        const newOrder: StoreOrder = {
          id: newOrderId,
          orderNumber,
          tableId: resolvedTableId,
          tableNumber: resolvedTableNumber,
          guestCount: 2,
          items: [newItem],
          subtotal,
          discountTotal: 0,
          taxTotal,
          grandTotal: subtotal + taxTotal,
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...prev, newOrder];
      }
    });

    setTables((prev) =>
      prev.map((t) =>
        t.id === resolvedTableId || t.number === resolvedTableNumber
          ? {
              ...t,
              status: t.status === 'AVAILABLE' ? 'OCCUPIED' : t.status,
              guestCount: t.guestCount || 2,
              currentOrderId: t.currentOrderId || createdOrderId || t.currentOrderId,
            }
          : t
      )
    );

    logAudit('ITEM_ADDED', 'ORDER_ITEM', newItem.id, `เพิ่มเมนู ${product.name} x${quantity} (฿${lineTotal.toFixed(2)}) โต๊ะ ${resolvedTableNumber}`);
  };

  // 3. UPDATE ORDER ITEM QTY
  const updateOrderItemQty = (tableId: string, itemId: string, delta: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if ((ord.tableId !== tableId && ord.tableNumber !== tableId) || ord.status === 'COMPLETED') return ord;
        const item = ord.items.find((i) => i.id === itemId);
        if (!item) return ord;

        const newQty = item.quantity + delta;
        if (newQty <= 0) {
          const updatedItems = ord.items.filter((i) => i.id !== itemId);
          const subtotal = updatedItems.reduce((s, i) => s + i.lineTotal, 0);
          const taxTotal = Math.round(subtotal * 0.07 * 100) / 100;
          return {
            ...ord,
            items: updatedItems,
            subtotal,
            taxTotal,
            grandTotal: subtotal + taxTotal,
            updatedAt: new Date().toISOString(),
          };
        }

        const updatedItems = ord.items.map((i) =>
          i.id === itemId
            ? { ...i, quantity: newQty, lineTotal: (i.unitPrice + i.modifierTotal) * newQty }
            : i
        );
        const subtotal = updatedItems.reduce((s, i) => s + i.lineTotal, 0);
        const taxTotal = Math.round(subtotal * 0.07 * 100) / 100;

        return {
          ...ord,
          items: updatedItems,
          subtotal,
          taxTotal,
          grandTotal: subtotal + taxTotal,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // 4. REMOVE ORDER ITEM
  const removeOrderItem = (tableId: string, itemId: string) => {
    updateOrderItemQty(tableId, itemId, -999);
  };

  // 4.1 HIGH-SECURITY VOID WITH PHOTO & SIGNATURE EVIDENCE
  const voidOrderItemWithEvidence = (
    tableId: string, 
    itemId: string, 
    evidence: { reason: string; photoUrl?: string; signatureUrl: string; managerName: string; pin: string }
  ) => {
    // 1. Verify PIN
    const approvingStaff = staffMembers.find((s) => s.pin === evidence.pin && s.isActive);
    if (!approvingStaff) {
      return { success: false, error: 'รหัส PIN ผู้จัดการ/ผู้อนุมัติไม่ถูกต้อง' };
    }

    const targetOrder = orders.find((o) => o.tableId === tableId || o.tableNumber === tableId);
    const targetItem = targetOrder?.items.find((i) => i.id === itemId);
    const itemDesc = targetItem ? `${targetItem.productName} x${targetItem.quantity} (฿${targetItem.lineTotal})` : itemId;
    const tableNum = targetOrder?.tableNumber || tableId;

    // 2. Remove item from order
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.tableId === tableId || ord.tableNumber === tableId) {
          const newItems = ord.items.filter((i) => i.id !== itemId);
          const subtotal = newItems.reduce((sum, i) => sum + i.lineTotal, 0);
          const taxTotal = Math.round(subtotal * 0.07 * 100) / 100;
          return {
            ...ord,
            items: newItems,
            subtotal,
            taxTotal,
            grandTotal: subtotal + taxTotal,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );

    // 3. Remove from KDS tickets if present
    setKdsTickets((prev) =>
      prev.map((t) => ({
        ...t,
        items: t.items.filter((i) => i.orderItemId !== itemId),
      }))
    );

    // 4. Create High-Security Audit Log with Photo and Signature
    const newLog: StoreAuditLog = {
      id: 'aud-void-' + Date.now(),
      timestamp: new Date().toISOString(),
      action: 'VOID_ORDER_ITEM',
      actor: approvingStaff.name,
      role: approvingStaff.role,
      entityType: 'ORDER_ITEM',
      entityId: itemId,
      details: `อนุมัติยกเลิก: ${itemDesc} [โต๊ะ ${tableNum}] เหตุผล: "${evidence.reason}" โดย ${approvingStaff.name}`,
      reason: evidence.reason,
      photoUrl: evidence.photoUrl,
      signatureUrl: evidence.signatureUrl,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    return { success: true };
  };

  // 5. SEND TO KITCHEN
  const sendOrderToKitchen = (tableId: string) => {
    const order = orders.find(
      (o) => (o.tableId === tableId || o.tableNumber === tableId) && (o.status === 'DRAFT' || o.status === 'CONFIRMED' || o.status === 'SENT_TO_KITCHEN')
    );
    if (!order || order.items.length === 0) return;

    const pendingItems = order.items.filter((i) => i.status === 'PENDING');
    if (pendingItems.length === 0 && order.status !== 'DRAFT') return;

    // Group items by station
    const stationGroups: Record<string, StoreOrderItem[]> = {};
    order.items.forEach((item) => {
      if (!stationGroups[item.station]) stationGroups[item.station] = [];
      stationGroups[item.station].push(item);
    });

    // Create KDS Tickets
    const newTickets: StoreKDSTicket[] = Object.entries(stationGroups).map(([station, sItems]) => ({
      id: 'kds-' + Date.now() + '-' + station,
      orderId: order.id,
      tableNumber: order.tableNumber,
      station,
      createdAt: new Date().toISOString(),
      status: 'NEW',
      items: sItems.map((si) => ({
        id: 'kds-item-' + si.id,
        orderItemId: si.id,
        productName: si.productName,
        quantity: si.quantity,
        modifiers: si.modifiers.map((m) => m.optionName),
        notes: si.notes,
        isReady: false,
      })),
    }));

    setKdsTickets((prev) => [...prev, ...newTickets]);

    // Update order and item statuses
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: 'SENT_TO_KITCHEN',
              items: o.items.map((i) => ({ ...i, status: 'SENT' })),
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    // Consume inventory based on recipe BOM
    order.items.forEach((item) => {
      const recipe = FIXTURE_RECIPES.find((r) => r.productId === item.productId);
      if (recipe) {
        recipe.items.forEach((ri) => {
          const totalDeduction = ri.quantity * item.quantity;
          setIngredients((prevIngs) =>
            prevIngs.map((ing) =>
              ing.id === ri.ingredientId ? { ...ing, stock: Math.max(0, Math.round((ing.stock - totalDeduction) * 1000) / 1000) } : ing
            )
          );
        });
      }
    });

    logAudit('SEND_TO_KITCHEN', 'ORDER', order.id, 'ส่งออเดอร์ ' + order.orderNumber + ' โต๊ะ ' + order.tableNumber + ' เข้าครัว (' + order.items.length + ' รายการ)');
  };

  // 6. BUMP KDS ITEM
  const bumpKDSItem = (ticketId: string, itemId: string) => {
    setKdsTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const updatedItems = t.items.map((i) => (i.id === itemId ? { ...i, isReady: !i.isReady } : i));
        const allReady = updatedItems.every((i) => i.isReady);
        return {
          ...t,
          items: updatedItems,
          status: allReady ? 'READY' : 'PREPARING',
        };
      })
    );
  };

  // 7. BUMP KDS TICKET
  const bumpKDSTicket = (ticketId: string) => {
    setKdsTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'READY',
              items: t.items.map((i) => ({ ...i, isReady: true })),
            }
          : t
      )
    );
  };

  // 7.1 RECALL KDS TICKET
  const recallKDSTicket = (ticketId: string) => {
    setKdsTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'PREPARING',
              items: t.items.map((i) => ({ ...i, isReady: false })),
            }
          : t
      )
    );
    logAudit('KDS_RECALL', 'KDS_TICKET', ticketId, 'เรียกคืนคิวอาหารกลับมาทำใหม่');
  };

  // 8. GENERATE BILL
  const generateBill = (tableId: string): string => {
    const table = tables.find((t) => t.id === tableId || t.number === tableId);
    const resolvedTableId = table ? table.id : tableId;
    const resolvedTableNumber = table ? table.number : tableId;

    const order = orders.find(
      (o) => (o.tableId === resolvedTableId || o.tableNumber === resolvedTableNumber) && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
    );
    if (!order) return '';

    const billNumber = 'B-' + order.orderNumber.replace('ORD-', '') + '-01';
    const newBillId = 'bill-' + Date.now();

    const newBill: StoreBill = {
      id: newBillId,
      billNumber,
      orderId: order.id,
      tableNumber: order.tableNumber,
      subtotal: order.subtotal,
      discountTotal: order.discountTotal,
      taxTotal: order.taxTotal,
      serviceCharge: 0,
      grandTotal: order.grandTotal,
      paidTotal: 0,
      balanceDue: order.grandTotal,
      status: 'OPEN',
      items: order.items.map((i) => ({
        id: i.id,
        productName: i.productName,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
        modifiers: i.modifiers.map((m) => m.optionName),
      })),
      createdAt: new Date().toISOString(),
    };

    setBills((prev) => [...prev, newBill]);
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status: 'BILL_REQUESTED' } : t)));

    logAudit('BILL_GENERATED', 'BILL', newBillId, 'เปิดบิล ' + billNumber + ' โต๊ะ ' + order.tableNumber + ' ยอดรวม ' + order.grandTotal + '฿');
    return newBillId;
  };

  // 9. SPLIT BILL BY ITEM
  const splitBillByItem = (billId: string, itemIds: string[]): { newBillId: string } => {
    const parentBill = bills.find((b) => b.id === billId);
    if (!parentBill || itemIds.length === 0) return { newBillId: '' };

    const splitItems = parentBill.items.filter((i) => itemIds.includes(i.id));
    const remainingItems = parentBill.items.filter((i) => !itemIds.includes(i.id));

    const splitSubtotal = splitItems.reduce((s, i) => s + i.lineTotal, 0);
    const splitTax = Math.round(splitSubtotal * 0.07 * 100) / 100;
    const splitGrand = splitSubtotal + splitTax;

    const remSubtotal = remainingItems.reduce((s, i) => s + i.lineTotal, 0);
    const remTax = Math.round(remSubtotal * 0.07 * 100) / 100;
    const remGrand = remSubtotal + remTax;

    const childBillId = 'bill-' + Date.now() + '-split';
    const childBillNumber = parentBill.billNumber + '/B';

    const childBill: StoreBill = {
      id: childBillId,
      billNumber: childBillNumber,
      orderId: parentBill.orderId,
      tableNumber: parentBill.tableNumber,
      parentBillId: parentBill.id,
      subtotal: splitSubtotal,
      discountTotal: 0,
      taxTotal: splitTax,
      serviceCharge: 0,
      grandTotal: splitGrand,
      paidTotal: 0,
      balanceDue: splitGrand,
      status: 'OPEN',
      items: splitItems,
      createdAt: new Date().toISOString(),
    };

    setBills((prev) => [
      ...prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              billNumber: parentBill.billNumber + '/A',
              items: remainingItems,
              subtotal: remSubtotal,
              taxTotal: remTax,
              grandTotal: remGrand,
              balanceDue: remGrand,
              status: 'OPEN' as const,
            }
          : b
      ),
      childBill,
    ]);

    logAudit('BILL_SPLIT_ITEM', 'BILL', billId, 'แยกบิล ' + parentBill.billNumber + ' ออกเป็น ' + childBillNumber + ' (' + splitGrand + '฿)');
    return { newBillId: childBillId };
  };

  // 10. SPLIT BILL BY AMOUNT (EQUAL SPLIT)
  const splitBillByAmount = (billId: string, partsCount: number) => {
    const parentBill = bills.find((b) => b.id === billId);
    if (!parentBill || partsCount <= 1) return;

    const splitAmount = Math.round((parentBill.grandTotal / partsCount) * 100) / 100;
    const newChildBills: StoreBill[] = [];

    for (let i = 1; i <= partsCount; i++) {
      const childId = 'bill-' + Date.now() + '-part-' + i;
      newChildBills.push({
        id: childId,
        billNumber: parentBill.billNumber + '-' + i + '/' + partsCount,
        orderId: parentBill.orderId,
        tableNumber: parentBill.tableNumber,
        parentBillId: parentBill.id,
        subtotal: splitAmount / 1.07,
        discountTotal: 0,
        taxTotal: splitAmount - splitAmount / 1.07,
        serviceCharge: 0,
        grandTotal: splitAmount,
        paidTotal: 0,
        balanceDue: splitAmount,
        status: 'OPEN',
        items: parentBill.items,
        createdAt: new Date().toISOString(),
      });
    }

    setBills((prev) => [
      ...prev.map((b) => (b.id === billId ? { ...b, status: 'SPLIT' as const } : b)),
      ...newChildBills,
    ]);

    logAudit('BILL_SPLIT_AMOUNT', 'BILL', billId, 'แยกบิล ' + parentBill.billNumber + ' หาร ' + partsCount + ' ยอดละ ' + splitAmount + '฿');
  };

  // 11. MERGE BILLS
  const mergeBills = (sourceBillId: string, targetBillId: string) => {
    const source = bills.find((b) => b.id === sourceBillId);
    const target = bills.find((b) => b.id === targetBillId);
    if (!source || !target) return;

    const mergedItems = [...target.items, ...source.items];
    const subtotal = target.subtotal + source.subtotal;
    const taxTotal = target.taxTotal + source.taxTotal;
    const grandTotal = target.grandTotal + source.grandTotal;

    setBills((prev) =>
      prev.map((b) => {
        if (b.id === sourceBillId) return { ...b, status: 'MERGED' as const };
        if (b.id === targetBillId) {
          return {
            ...b,
            items: mergedItems,
            subtotal,
            taxTotal,
            grandTotal,
            balanceDue: grandTotal,
          };
        }
        return b;
      })
    );

    logAudit('BILL_MERGE', 'BILL', targetBillId, 'รวมบิล ' + source.billNumber + ' เข้ากับ ' + target.billNumber + ' (ยอดรวมใหม่ ' + grandTotal + '฿)');
  };

  // 12. APPLY DISCOUNT
  const applyDiscount = (billId: string, discountAmount: number, reason: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== billId) return b;
        const newDiscount = Math.min(b.subtotal, discountAmount);
        const taxable = b.subtotal - newDiscount;
        const taxTotal = Math.round(taxable * 0.07 * 100) / 100;
        const grandTotal = taxable + taxTotal;
        return {
          ...b,
          discountTotal: newDiscount,
          taxTotal,
          grandTotal,
          balanceDue: grandTotal - b.paidTotal,
        };
      })
    );

    logAudit('BILL_DISCOUNT', 'BILL', billId, 'ให้ส่วนลด ' + discountAmount + '฿ (เหตุผล: ' + reason + ')');
  };

  // 13. PROCESS PAYMENT & ACCOUNTING JOURNAL
  const processPayment = (
    billId: string,
    method: 'CASH' | 'PROMPTPAY' | 'CREDIT_CARD',
    amount: number,
    tenderAmount?: number
  ): { success: boolean; changeDue: number; paymentId: string } => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill || bill.status === 'PAID') {
      return { success: false, changeDue: 0, paymentId: '' };
    }

    const changeDue = method === 'CASH' && tenderAmount && tenderAmount > amount ? tenderAmount - amount : 0;
    const paymentId = 'pay-' + Date.now();

    const newPayment: StorePayment = {
      id: paymentId,
      billId,
      method,
      amount,
      tenderAmount: tenderAmount || amount,
      changeDue,
      referenceNumber: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [...prev, newPayment]);

    const newPaidTotal = bill.paidTotal + amount;
    const newBalanceDue = Math.max(0, bill.grandTotal - newPaidTotal);
    const isPaidInFull = newBalanceDue === 0;

    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              paidTotal: newPaidTotal,
              balanceDue: newBalanceDue,
              status: isPaidInFull ? ('PAID' as const) : ('PARTIALLY_PAID' as const),
            }
          : b
      )
    );

    // If bill is paid, complete order & free table
    if (isPaidInFull && bill.orderId) {
      setOrders((prev) => prev.map((o) => (o.id === bill.orderId ? { ...o, status: 'COMPLETED' } : o)));
      if (bill.tableNumber) {
        setTables((prev) =>
          prev.map((t) => (t.number === bill.tableNumber ? { ...t, status: 'AVAILABLE', currentOrderId: undefined, guestCount: 0 } : t))
        );
      }
    }

    // Double-Entry Accounting Entry
    const foodSales = Math.round((amount / 1.07) * 100) / 100;
    const vatPayable = amount - foodSales;

    const accountCode = method === 'CASH' ? '1001' : method === 'PROMPTPAY' ? '1002' : '1003';
    const accountName = method === 'CASH' ? 'เงินสดในมือ (Cash)' : method === 'PROMPTPAY' ? 'เงินฝากธนาคาร PromptPay' : 'ลูกหนี้บัตรเครดิต EDC';

    const newJournalEntry: StoreJournalEntry = {
      id: 'je-' + Date.now(),
      entryNumber: 'JE-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString().split('T')[0],
      reference: bill.billNumber,
      description: 'รับชำระเงินบิล ' + bill.billNumber + ' (' + method + ')',
      lines: [
        { accountCode, accountName, debit: amount, credit: 0 },
        { accountCode: '4001', accountName: 'รายได้จากการขายอาหาร (Food Revenue)', debit: 0, credit: foodSales },
        { accountCode: '2001', accountName: 'ภาษีขาย (VAT Payable 7%)', debit: 0, credit: vatPayable },
      ],
    };

    setJournalEntries((prev) => [newJournalEntry, ...prev]);
    logAudit('PAYMENT_RECEIVED', 'PAYMENT', paymentId, 'รับชำระ ' + method + ' ยอด ' + amount + '฿ บิล ' + bill.billNumber);

    return { success: true, changeDue, paymentId };
  };

  // 14. PROCESS REFUND
  const processRefund = (paymentId: string, reason: string, pin: string): { success: boolean; error?: string } => {
    if (pin !== '1234') {
      return { success: false, error: 'รหัส Manager PIN ไม่ถูกต้อง' };
    }

    const payment = payments.find((p) => p.id === paymentId);
    if (!payment || payment.status === 'REFUNDED') {
      return { success: false, error: 'ไม่พบรายการชำระเงิน หรือถูกคืนเงินไปแล้ว' };
    }

    setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, status: 'REFUNDED' } : p)));
    setBills((prev) =>
      prev.map((b) => (b.id === payment.billId ? { ...b, status: 'REFUNDED', balanceDue: b.grandTotal, paidTotal: 0 } : b))
    );

    // Reversal Journal Entry
    const foodSales = Math.round((payment.amount / 1.07) * 100) / 100;
    const vatPayable = payment.amount - foodSales;

    const newJournalEntry: StoreJournalEntry = {
      id: 'je-' + Date.now(),
      entryNumber: 'JE-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString().split('T')[0],
      reference: 'REFUND-' + payment.referenceNumber,
      description: 'รายการกลับรายการ / คืนเงิน (เหตุผล: ' + reason + ')',
      lines: [
        { accountCode: '4001', accountName: 'รายได้จากการขายอาหาร (Food Revenue)', debit: foodSales, credit: 0 },
        { accountCode: '2001', accountName: 'ภาษีขาย (VAT Payable 7%)', debit: vatPayable, credit: 0 },
        { accountCode: '1001', accountName: 'เงินสดในมือ (Cash)', debit: 0, credit: payment.amount },
      ],
    };

    setJournalEntries((prev) => [newJournalEntry, ...prev]);
    logAudit('PAYMENT_REFUNDED', 'PAYMENT', paymentId, 'คืนเงินยอด ' + payment.amount + '฿ (เหตุผล: ' + reason + ')');

    return { success: true };
  };

  // 15. STOCK ADJUSTMENT & WASTE
  const adjustStock = (ingredientId: string, delta: number, reason: string) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === ingredientId ? { ...ing, stock: Math.max(0, ing.stock + delta) } : ing))
    );
    logAudit('STOCK_ADJUSTMENT', 'INGREDIENT', ingredientId, 'ปรับยอดสต็อก ' + (delta > 0 ? '+' : '') + delta + ' (เหตุผล: ' + reason + ')');
  };

  const recordWaste = (ingredientId: string, quantity: number, reason: string) => {
    adjustStock(ingredientId, -quantity, 'ของเสีย / Spoilage: ' + reason);
  };

  // 16. QR CODE TABLE ORDERING
  // 16.1 Customer submits QR order from table -> Order created with PENDING_APPROVAL
  const submitQROrder = (
    tableNumber: string,
    items: Array<{ product: FixtureProduct; quantity: number; modifiers: OrderItemModifierOption[]; notes?: string }>,
    customerName?: string
  ): string => {
    const table = tables.find((t) => t.number.toLowerCase() === tableNumber.toLowerCase() || t.id === tableNumber) || tables[0];
    const newOrderId = 'ord-qr-' + Date.now();
    const orderNumber = 'QR-' + Math.floor(1000 + Math.random() * 9000);

    const storeItems: StoreOrderItem[] = items.map((it, idx) => {
      const modifierTotal = it.modifiers.reduce((s, m) => s + m.price, 0);
      const lineTotal = (it.product.price + modifierTotal) * it.quantity;
      return {
        id: 'item-qr-' + Date.now() + '-' + idx,
        productId: it.product.id,
        productName: it.product.name,
        unitPrice: it.product.price,
        quantity: it.quantity,
        modifiers: it.modifiers,
        modifierTotal,
        lineTotal,
        station: it.product.station,
        notes: it.notes,
        status: 'PENDING',
      };
    });

    const subtotal = storeItems.reduce((s, i) => s + i.lineTotal, 0);
    const taxTotal = Math.round(subtotal * 0.07 * 100) / 100;
    const grandTotal = subtotal + taxTotal;

    const newOrder: StoreOrder = {
      id: newOrderId,
      orderNumber,
      tableId: table.id,
      tableNumber: table.number,
      guestCount: 2,
      source: 'CUSTOMER_QR',
      approvalStatus: 'PENDING_APPROVAL',
      customerName: customerName || 'ลูกค้าโต๊ะ ' + table.number,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtotal,
      discountTotal: 0,
      taxTotal,
      grandTotal,
      items: storeItems,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Also link table if not occupied or assign currentOrderId
    setTables((prev) =>
      prev.map((t) =>
        t.id === table.id && t.status === 'AVAILABLE'
          ? { ...t, currentOrderId: newOrderId }
          : t
      )
    );

    logAudit(
      'QR_ORDER_SUBMITTED',
      'ORDER',
      newOrderId,
      `ลูกค้าโต๊ะ ${table.number} (${newOrder.customerName}) ส่งออเดอร์ QR (${storeItems.length} รายการ, ฿${grandTotal.toFixed(2)}) รอ POS อนุมัติ`
    );

    return newOrderId;
  };

  // 16.2 POS approves QR Order -> Table occupied, KDS tickets created, inventory deducted, status SENT_TO_KITCHEN
  const approveQROrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Update order status to APPROVED and SENT_TO_KITCHEN
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              approvalStatus: 'APPROVED',
              status: 'SENT_TO_KITCHEN',
              items: o.items.map((i) => ({ ...i, status: 'SENT' })),
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    // Update Table to OCCUPIED
    setTables((prev) =>
      prev.map((t) =>
        t.id === order.tableId
          ? { ...t, status: 'OCCUPIED', currentOrderId: order.id, guestCount: t.guestCount || 2 }
          : t
      )
    );

    // Create KDS Tickets grouped by station
    const stationGroups: Record<string, StoreOrderItem[]> = {};
    order.items.forEach((item) => {
      if (!stationGroups[item.station]) stationGroups[item.station] = [];
      stationGroups[item.station].push(item);
    });

    const newTickets: StoreKDSTicket[] = Object.entries(stationGroups).map(([station, sItems]) => ({
      id: 'kds-' + Date.now() + '-' + station,
      orderId: order.id,
      tableNumber: order.tableNumber + ' (QR)',
      station,
      createdAt: new Date().toISOString(),
      status: 'NEW',
      items: sItems.map((si) => ({
        id: 'kds-item-' + si.id,
        orderItemId: si.id,
        productName: si.productName,
        quantity: si.quantity,
        modifiers: si.modifiers.map((m) => m.optionName),
        notes: si.notes,
        isReady: false,
      })),
    }));

    setKdsTickets((prev) => [...prev, ...newTickets]);

    // Inventory BOM Deduction
    order.items.forEach((item) => {
      const recipe = FIXTURE_RECIPES.find((r) => r.productId === item.productId);
      if (recipe) {
        recipe.items.forEach((ri) => {
          const totalDeduction = ri.quantity * item.quantity;
          setIngredients((prevIngs) =>
            prevIngs.map((ing) =>
              ing.id === ri.ingredientId ? { ...ing, stock: Math.max(0, ing.stock - totalDeduction) } : ing
            )
          );
        });
      }
    });

    logAudit(
      'QR_ORDER_APPROVED',
      'ORDER',
      order.id,
      `POS อนุมัติออเดอร์ QR โต๊ะ ${order.tableNumber} (${order.orderNumber}) -> ส่งรายการเข้าครัว KDS เรียบร้อย`
    );
  };

  // 16.3 POS rejects QR Order
  const rejectQROrder = (orderId: string, reason: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, approvalStatus: 'REJECTED', status: 'CANCELLED', updatedAt: new Date().toISOString() }
          : o
      )
    );

    logAudit(
      'QR_ORDER_REJECTED',
      'ORDER',
      order.id,
      `POS ปฏิเสธรายการ QR โต๊ะ ${order.tableNumber} (${order.orderNumber}) เหตุผล: ${reason}`
    );
  };

  return (
    <RestaurantContext.Provider
      value={{
        activeRole,
        setActiveRole,
        restaurantSettings,
        updateRestaurantSettings,
        tables,
        orders,
        kdsTickets,
        bills,
        payments,
        products,
        ingredients,
        recipes,
        staffMembers,
        currentStaff,
        isAuthenticated,
        logoutStaff,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        switchStaffByPin,
        voidOrderItemWithEvidence,
        journalEntries,
        auditLogs,
        addProduct,
        updateProduct,
        deleteProduct,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        updateRecipe,
        openTable,
        addOrderItem,
        updateOrderItemQty,
        removeOrderItem,
        sendOrderToKitchen,
        bumpKDSItem,
        bumpKDSTicket,
        recallKDSTicket,
        generateBill,
        splitBillByItem,
        splitBillByAmount,
        mergeBills,
        applyDiscount,
        processPayment,
        processRefund,
        adjustStock,
        recordWaste,
        submitQROrder,
        approveQROrder,
        rejectQROrder,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider');
  return ctx;
}
