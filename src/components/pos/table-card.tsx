'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/lib/store/restaurant-store';
import { Users, Receipt, UtensilsCrossed, Plus, Minus, QrCode, AlertCircle } from 'lucide-react';

interface TableCardProps {
  table: {
    id: string;
    number: string;
    name: string;
    capacity: number;
    floor: string;
    status: string;
    guestCount?: number;
    currentOrderId?: string;
  };
  onOpenOrder: (table: any) => void;
  onOpenBilling: (table: any) => void;
  onOpenQR: (table: any) => void;
  onOpenApproval: (order: any) => void;
}

export function TableCard({ table, onOpenOrder, onOpenBilling, onOpenQR, onOpenApproval }: TableCardProps) {
  const { orders, openTable } = useRestaurant();
  const [guestCountInput, setGuestCountInput] = useState(2);
  const [showOpenModal, setShowOpenModal] = useState(false);

  const activeOrder = orders.find(
    (o) => (o.tableId === table.id || o.tableNumber === table.number) && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );
  const pendingQROrder = orders.find(
    (o) => (o.tableId === table.id || o.tableNumber === table.number) && o.approvalStatus === 'PENDING_APPROVAL'
  );

  const getCardTheme = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          cardBg: 'bg-white border-emerald-200/80 hover:border-emerald-500 hover:shadow-lg',
          badgeBg: 'bg-emerald-100 text-[#0C3B2E] border-emerald-300',
          badgeText: '● โต๊ะว่าง',
        };
      case 'OCCUPIED':
        return {
          cardBg: 'bg-white border-amber-300 hover:border-amber-500 shadow-md',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          badgeText: '● มีลูกค้านั่งทาน',
        };
      case 'BILL_REQUESTED':
        return {
          cardBg: 'bg-white border-[#D9531E]/40 hover:border-[#D9531E] shadow-md',
          badgeBg: 'bg-[#FFEDD5] text-[#9A3412] border-[#D9531E]/30',
          badgeText: '● รอชำระเงิน',
        };
      default:
        return {
          cardBg: 'bg-white border-slate-200 shadow-sm',
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          badgeText: status,
        };
    }
  };

  const theme = getCardTheme(table.status);

  const handleOpen = () => {
    openTable(table.id, guestCountInput);
    setShowOpenModal(false);
    onOpenOrder(table);
  };

  return (
    <div
      className={
        'rounded-3xl border-2 p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 relative min-h-[180px] ' +
        (pendingQROrder ? 'border-amber-400 ring-4 ring-amber-100 shadow-lg bg-amber-50/20' : theme.cardBg)
      }
    >
      {/* Table Header */}
      <div>
        <div className='flex items-start justify-between gap-2 mb-3'>
          {/* Left: Table Icon & Name */}
          <div className='flex items-center space-x-3 min-w-0 flex-1'>
            <div className='w-12 h-12 rounded-2xl bg-[#0C3B2E] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0'>
              {table.number}
            </div>
            <div className='min-w-0 flex-1'>
              <h4 className='font-semibold text-slate-800 text-sm sm:text-base truncate leading-tight'>
                {table.name}
              </h4>
              <div className='flex items-center space-x-1.5 text-[11px] sm:text-xs text-slate-500 mt-1 whitespace-nowrap'>
                <span className='flex items-center gap-1 font-medium'>
                  <Users className='w-3.5 h-3.5 text-slate-400' />
                  {table.guestCount ? `${table.guestCount}/${table.capacity}` : `${table.capacity}`} ที่นั่ง
                </span>
                <span>•</span>
                <span className='font-medium'>ชั้น {table.floor}</span>
              </div>
            </div>
          </div>

          {/* Right: Status Badge & QR Button */}
          <div className='flex flex-col items-end gap-1 shrink-0'>
            <span className={'px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium border whitespace-nowrap ' + theme.badgeBg}>
              {theme.badgeText}
            </span>
            <button
              type='button'
              onClick={() => onOpenQR(table)}
              title='แสดง QR Code ประจำโต๊ะ'
              className='px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#0C3B2E] text-slate-700 hover:text-white flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer active:scale-95'
            >
              <QrCode className='w-3.5 h-3.5 text-[#0C3B2E]' />
              <span>QR</span>
            </button>
          </div>
        </div>

        {/* Pending QR Approval Callout */}
        {pendingQROrder && (
          <div className='bg-amber-100/90 rounded-2xl p-3 border border-amber-300 mb-3 text-xs space-y-2 animate-pulse'>
            <div className='flex justify-between items-center font-semibold text-amber-950'>
              <span className='flex items-center gap-1'>
                <AlertCircle className='w-3.5 h-3.5 text-amber-700' />
                <span>มีออเดอร์ QR รออนุมัติ!</span>
              </span>
              <span className='text-[#D9531E] font-black'>฿{pendingQROrder.grandTotal.toFixed(2)}</span>
            </div>
            <button
              type='button'
              onClick={() => onOpenApproval(pendingQROrder)}
              className='w-full py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-semibold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm transition-transform active:scale-95 cursor-pointer'
            >
              <span>กดตรวจสอบ & อนุมัติส่งครัว</span>
            </button>
          </div>
        )}

        {/* Active Order Summary Card */}
        {activeOrder && !pendingQROrder && (
          <div className='bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 mb-3 text-xs space-y-1.5'>
            <div className='flex justify-between items-center font-semibold text-slate-800'>
              <span className='text-[11px] text-slate-500 font-mono'>{activeOrder.orderNumber}</span>
              <span className='text-[#D9531E] font-semibold text-sm sm:text-base'>฿{activeOrder.grandTotal.toFixed(2)}</span>
            </div>
            <div className='text-slate-600 text-[11px] font-medium line-clamp-2'>
              {activeOrder.items.length > 0
                ? activeOrder.items.map((i) => `${i.productName} x${i.quantity}`).join(', ')
                : 'ยังไม่ได้เลือกเมนู'}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='pt-3 border-t border-slate-100'>
        {table.status === 'AVAILABLE' ? (
          <>
            {showOpenModal ? (
              <div className='space-y-2'>
                <div className='flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl'>
                  <span className='text-xs font-bold text-slate-600 pl-2'>จำนวนลูกค้า:</span>
                  <div className='flex items-center space-x-2 bg-white rounded-xl px-2 py-1 shadow-xs'>
                    <button
                      type='button'
                      onClick={() => setGuestCountInput((q) => Math.max(1, q - 1))}
                      className='w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 font-bold cursor-pointer active:scale-95'
                    >
                      <Minus className='w-3.5 h-3.5' />
                    </button>
                    <span className='font-semibold text-xs w-4 text-center'>{guestCountInput}</span>
                    <button
                      type='button'
                      onClick={() => setGuestCountInput((q) => Math.min(table.capacity, q + 1))}
                      className='w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 font-bold cursor-pointer active:scale-95'
                    >
                      <Plus className='w-3.5 h-3.5' />
                    </button>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={handleOpen}
                    className='flex-1 py-2.5 sm:py-3 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-semibold rounded-2xl text-xs shadow-sm transition-transform active:scale-98 cursor-pointer'
                  >
                    ยืนยันเปิดโต๊ะ
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowOpenModal(false)}
                    className='px-3 py-2.5 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer'
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-3 gap-2'>
                <button
                  type='button'
                  onClick={() => onOpenQR(table)}
                  className='py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95'
                >
                  <QrCode className='w-3.5 h-3.5 text-[#0C3B2E]' />
                  <span>QR</span>
                </button>
                <button
                  type='button'
                  onClick={() => setShowOpenModal(true)}
                  className='col-span-2 py-2.5 sm:py-3 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-semibold rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-transform active:scale-98 cursor-pointer'
                >
                  <Plus className='w-4 h-4 text-[#072E20]' />
                  <span>เปิดโต๊ะนั่งทาน</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className='grid grid-cols-2 gap-2'>
            <button
              type='button'
              onClick={() => onOpenOrder(table)}
              className='py-2.5 sm:py-3 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-1 shadow-sm transition-transform active:scale-98 cursor-pointer'
            >
              <UtensilsCrossed className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#84CC16]' />
              <span>สั่งอาหาร</span>
            </button>
            <button
              type='button'
              onClick={() => onOpenBilling(table)}
              className='py-2.5 sm:py-3 bg-[#D9531E] hover:bg-[#B45309] text-white font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-1 shadow-sm transition-transform active:scale-98 cursor-pointer'
            >
              <Receipt className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
              <span>เช็คบิล</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
