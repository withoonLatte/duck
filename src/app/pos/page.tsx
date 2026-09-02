'use client';

import React, { useState } from 'react';
import { useRestaurant, StoreOrder } from '@/lib/store/restaurant-store';
import { TableCard } from '@/components/pos/table-card';
import { POSOrderDrawer } from '@/components/pos/pos-order-drawer';
import { POSBillingDrawer } from '@/components/pos/pos-billing-drawer';
import { QRApprovalModal } from '@/components/pos/qr-approval-modal';
import { QRCodeModal } from '@/components/pos/qr-code-modal';
import { 
  Store, 
  Filter, 
  QrCode, 
  ArrowRight, 
  Receipt,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function POSPage() {
  const { tables, orders, bills, payments, restaurantSettings } = useRestaurant();
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');

  // Unified State for In-Page Order, Billing, QR, and Approval Modals
  const [activeOrderTable, setActiveOrderTable] = useState<any | null>(null);
  const [activeBillingTable, setActiveBillingTable] = useState<any | null>(null);
  const [selectedQRTable, setSelectedQRTable] = useState<any | null>(null);
  const [selectedApprovalOrder, setSelectedApprovalOrder] = useState<StoreOrder | null>(null);

  const filteredTables = tables.filter((t) => (selectedFloor === 'ALL' ? true : t.floor === selectedFloor));

  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED').length;
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;
  const totalRevenue = payments.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);

  const pendingQROrders = orders.filter((o) => o.approvalStatus === 'PENDING_APPROVAL');

  const handleProceedToBillingFromOrder = () => {
    if (!activeOrderTable) return;
    const t = activeOrderTable;
    setActiveOrderTable(null);
    setActiveBillingTable(t);
  };

  return (
    <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1 flex flex-col space-y-4 sm:space-y-6'>
      {/* Header Banner */}
      <div 
        className='relative rounded-3xl p-5 sm:p-7 text-white shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-cyan-300/40'
        style={{
          backgroundImage: "linear-gradient(to right, rgba(0, 30, 45, 0.72) 0%, rgba(0, 40, 50, 0.45) 50%, rgba(0, 0, 0, 0.2) 100%), url('/images/banner-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='relative z-10'>
          <div className='inline-flex items-center space-x-2 px-3 py-1 bg-black/35 backdrop-blur-md rounded-full text-xs font-bold text-[#84CC16] border border-white/20 mb-2 shadow-xs'>
            <Store className='w-4 h-4 text-[#84CC16]' />
            <span>ALL-IN-ONE POS MASTER SCREEN</span>
          </div>
          <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-white'>
            {restaurantSettings.name}
          </h2>
          <p className='text-white/85 text-xs sm:text-sm mt-1 font-normal max-w-2xl'>
            ระบบจัดการผังโต๊ะ, สั่งอาหาร, แยกบิล/เช็คบิล และอนุมัติออเดอร์ QR รวมครบจบในหน้าเดียว
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className='relative z-10 flex items-center gap-2 text-xs flex-wrap'>
          <div className='bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-white flex items-center gap-2 shadow-md'>
            <span className='w-2.5 h-2.5 rounded-full bg-[#84CC16]' />
            <span className='text-white/80 font-medium'>โต๊ะว่าง:</span>
            <span className='font-semibold text-white text-sm'>{availableCount}</span>
          </div>
          <div className='bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-white flex items-center gap-2 shadow-md'>
            <span className='w-2.5 h-2.5 rounded-full bg-[#D9531E]' />
            <span className='text-white/80 font-medium'>มีลูกค้า:</span>
            <span className='font-semibold text-white text-sm'>{occupiedCount}</span>
          </div>
          <div className='bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-white flex items-center gap-2 shadow-md'>
            <Receipt className='w-3.5 h-3.5 text-[#84CC16]' />
            <span className='text-white/80 font-medium'>ยอดขายวันนี้:</span>
            <span className='font-semibold text-[#84CC16] text-sm'>฿{totalRevenue.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Active QR Order Approval Bar if any pending */}
      {pendingQROrders.length > 0 && (
        <div className='bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 animate-in slide-in-from-top border-2 border-amber-200'>
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center font-black shadow-md animate-bounce shrink-0'>
              <QrCode className='w-6 h-6' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='px-2 py-0.5 rounded-full bg-white text-amber-900 font-semibold text-[10px] uppercase'>
                  🔔 รออนุมัติ ({pendingQROrders.length} รายการ)
                </span>
                <span className='text-xs font-semibold text-amber-100'>ลูกค้าสั่งอาหารผ่าน QR Code</span>
              </div>
              <h3 className='text-base sm:text-lg font-bold tracking-tight mt-0.5'>
                มีรายการใหม่จาก โต๊ะ {pendingQROrders.map((p) => p.tableNumber).join(', ')}
              </h3>
            </div>
          </div>

          <div className='flex items-center gap-2 flex-wrap'>
            {pendingQROrders.map((order) => (
              <button
                key={order.id}
                type='button'
                onClick={() => setSelectedApprovalOrder(order)}
                className='px-4 py-2.5 bg-white hover:bg-amber-50 text-slate-900 font-semibold rounded-2xl text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer'
              >
                <span>ตรวจบิล {order.tableNumber} (฿{order.grandTotal.toFixed(0)})</span>
                <ArrowRight className='w-3.5 h-3.5 text-amber-600' />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs & Quick Tools Bar */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-2.5 sm:p-3 rounded-3xl border border-slate-200 shadow-sm gap-2'>
        <div className='flex items-center space-x-1.5 text-xs overflow-x-auto pb-1 sm:pb-0 scrollbar-none'>
          <span className='font-medium text-slate-500 px-2 sm:px-3 flex items-center gap-1.5 shrink-0'>
            <Filter className='w-3.5 h-3.5 text-[#0C3B2E]' /> ชั้น:
          </span>
          {['ALL', '1', '2'].map((fl) => (
            <button
              key={fl}
              type='button'
              onClick={() => setSelectedFloor(fl)}
              className={
                'px-3.5 sm:px-4 py-2 rounded-2xl font-medium text-xs transition-all whitespace-nowrap cursor-pointer ' +
                (selectedFloor === fl
                  ? 'bg-[#0C3B2E] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100')
              }
            >
              {fl === 'ALL' ? 'ทุกชั้น (8 โต๊ะ)' : 'ชั้น ' + fl}
            </button>
          ))}
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          <Link
            href='/order?table=T01'
            target='_blank'
            className='flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0C3B2E] rounded-2xl text-xs font-medium flex items-center gap-1.5 border border-emerald-200 transition-colors whitespace-nowrap'
          >
            <QrCode className='w-4 h-4' />
            <span>หน้าลูกค้า (Customer QR)</span>
          </Link>
          <Link
            href='/settings'
            className='px-3.5 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap'
          >
            <Settings className='w-4 h-4' />
            <span>ตั้งค่าร้าน</span>
          </Link>
        </div>
      </div>

      {/* Tables Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'>
        {filteredTables.map((table) => (
          <TableCard 
            key={table.id} 
            table={table} 
            onOpenOrder={(t) => setActiveOrderTable(t)}
            onOpenBilling={(t) => setActiveBillingTable(t)}
            onOpenQR={(t) => setSelectedQRTable(t)}
            onOpenApproval={(ord) => setSelectedApprovalOrder(ord)}
          />
        ))}
      </div>

      {/* Integrated In-Page Order Taking Drawer */}
      {activeOrderTable && (
        <POSOrderDrawer
          table={activeOrderTable}
          onClose={() => setActiveOrderTable(null)}
          onProceedToBilling={handleProceedToBillingFromOrder}
        />
      )}

      {/* Integrated In-Page Billing & Payment Drawer */}
      {activeBillingTable && (
        <POSBillingDrawer
          table={activeBillingTable}
          onClose={() => setActiveBillingTable(null)}
        />
      )}

      {/* Dynamic Table QR Code Modal (Rendered at POS root for 100% z-index safety) */}
      {selectedQRTable && (
        <QRCodeModal
          table={selectedQRTable}
          onClose={() => setSelectedQRTable(null)}
        />
      )}

      {/* QR Order Approval Modal (Rendered at POS root for 100% z-index safety) */}
      {selectedApprovalOrder && (
        <QRApprovalModal
          order={selectedApprovalOrder}
          onClose={() => setSelectedApprovalOrder(null)}
        />
      )}
    </div>
  );
}
