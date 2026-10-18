'use client';

import React from 'react';
import { useRestaurant, StoreOrder } from '@/lib/store/restaurant-store';
import { ShoppingBag, UtensilsCrossed, Receipt, Plus } from 'lucide-react';

interface TakeawayCardProps {
  onOpenOrder: (table: any) => void;
  onOpenBilling: (table: any) => void;
}

export function TakeawayCard({ onOpenOrder, onOpenBilling }: TakeawayCardProps) {
  const { orders } = useRestaurant();

  // Find active takeaway order (tableNumber = 'TAKEAWAY' or tableId = 'takeaway')
  const activeTakeawayOrder = orders.find(
    (o) => (o.tableId === 'takeaway' || o.tableNumber === 'TAKEAWAY') && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );

  const isOccupied = !!activeTakeawayOrder;

  const takeawayTableObj = {
    id: 'takeaway',
    number: 'TAKEAWAY',
    name: 'สั่งกลับบ้าน (Takeaway)',
    status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
    capacity: 0,
    floor: '1',
    currentOrderId: activeTakeawayOrder?.id,
  };

  return (
    <div
      className={
        'rounded-3xl border-2 p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 relative min-h-[180px] ' +
        (isOccupied
          ? 'bg-white border-pink-300 hover:border-pink-500 shadow-md ring-2 ring-pink-100'
          : 'bg-white border-emerald-300 hover:border-emerald-500 hover:shadow-lg')
      }
    >
      {/* Header */}
      <div>
        <div className='flex items-start justify-between gap-2 mb-3'>
          {/* Left: Green Bag Icon & Text */}
          <div className='flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1'>
            {/* Takeaway Green Bag Image */}
            <div className='relative shrink-0 flex items-center justify-center'>
              <img
                src='/images/tables/takeaway-bag.png'
                alt='สั่งกลับบ้าน'
                className='h-12 sm:h-14 w-auto object-contain shrink-0 drop-shadow-xs transition-transform hover:scale-105'
              />
            </div>

            {/* Title & Badge */}
            <div className='min-w-0 flex-1 space-y-0.5'>
              <div className='font-black text-slate-900 text-lg sm:text-xl leading-tight tracking-tight flex flex-col'>
                <span>สั่ง</span>
                <span className='-mt-1'>กลับบ้าน</span>
              </div>
              <div className='text-[10px] sm:text-[11px] text-slate-500 font-medium'>
                Takeaway / ห่อกลับ
              </div>
            </div>
          </div>

          {/* Right: Status Badge */}
          <div className='shrink-0'>
            <span
              className={
                'px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border whitespace-nowrap shadow-2xs ' +
                (isOccupied
                  ? 'bg-pink-50 text-pink-700 border-pink-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300')
              }
            >
              {isOccupied ? '● มีออเดอร์ค้าง' : '● พร้อมรับสั่ง'}
            </span>
          </div>
        </div>

        {/* Active Takeaway Order Summary Card */}
        {activeTakeawayOrder ? (
          <div className='bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 mb-3 text-xs space-y-1.5'>
            <div className='flex justify-between items-center font-semibold text-slate-800'>
              <span className='text-[11px] text-slate-500 font-mono'>{activeTakeawayOrder.orderNumber}</span>
              <span className='text-[#D9531E] font-semibold text-sm sm:text-base'>
                ฿{activeTakeawayOrder.grandTotal.toFixed(2)}
              </span>
            </div>
            <div className='text-slate-600 text-[11px] font-medium line-clamp-2'>
              {activeTakeawayOrder.items.length > 0
                ? activeTakeawayOrder.items.map((i) => `${i.productName} x${i.quantity}`).join(', ')
                : 'ยังไม่ได้เลือกเมนู'}
            </div>
          </div>
        ) : (
          <div className='p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 mb-3 text-center'>
            <p className='text-xs font-bold text-emerald-800'>
              🛍️ รับออเดอร์ลูกค้าหน้าร้านห่อกลับบ้าน
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='pt-2'>
        {!isOccupied ? (
          <button
            type='button'
            onClick={() => onOpenOrder(takeawayTableObj)}
            className='w-full py-2.5 sm:py-3 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-sm transition-transform active:scale-98 cursor-pointer'
          >
            <Plus className='w-4 h-4 text-[#072E20]' />
            <span>+ สั่งกลับบ้านทันที</span>
          </button>
        ) : (
          <div className='grid grid-cols-2 gap-2'>
            <button
              type='button'
              onClick={() => onOpenOrder(takeawayTableObj)}
              className='py-2.5 sm:py-3 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-semibold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-1 shadow-sm transition-transform active:scale-98 cursor-pointer'
            >
              <UtensilsCrossed className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#84CC16]' />
              <span>สั่งเพิ่ม</span>
            </button>
            <button
              type='button'
              onClick={() => onOpenBilling(takeawayTableObj)}
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
