'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/lib/store/restaurant-store';
import { Plus, Minus, Trash2, Send, ShoppingBag, CheckCircle2, ChefHat, Receipt, ArrowRight, History } from 'lucide-react';
import Link from 'next/link';

interface OrderCartProps {
  selectedTableId: string;
}

export function OrderCart({ selectedTableId }: OrderCartProps) {
  const { orders, tables, updateOrderItemQty, removeOrderItem, sendOrderToKitchen, generateBill } = useRestaurant();
  const [showSentSuccess, setShowSentSuccess] = useState(false);

  const currentTable = tables.find((t) => t.id === selectedTableId);
  const activeOrder = orders.find((o) => o.tableId === selectedTableId && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  if (!currentTable) {
    return (
      <div className='bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400'>
        <ShoppingBag className='w-12 h-12 mx-auto mb-2 opacity-40' />
        <p className='text-xs font-bold'>กรุณาเลือกโต๊ะก่อนสั่งอาหาร</p>
      </div>
    );
  }

  const items = activeOrder?.items || [];
  const pendingItems = items.filter((i) => i.status === 'PENDING');
  const sentItems = items.filter((i) => i.status !== 'PENDING');

  const subtotal = activeOrder?.subtotal || 0;
  const taxTotal = activeOrder?.taxTotal || 0;
  const grandTotal = activeOrder?.grandTotal || 0;

  const handleSend = () => {
    if (pendingItems.length === 0 && items.length === 0) return;
    sendOrderToKitchen(selectedTableId);
    setShowSentSuccess(true);
    setTimeout(() => {
      setShowSentSuccess(false);
    }, 4000);
  };

  return (
    <div className='bg-white rounded-2xl border border-slate-200 flex flex-col h-full shadow-sm overflow-hidden'>
      {/* Cart Header */}
      <div className='p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between'>
        <div>
          <div className='flex items-center space-x-2'>
            <span className='font-black text-slate-900 text-base'>{currentTable.number}</span>
            <span className='text-xs text-slate-500 font-medium'>({currentTable.name})</span>
          </div>
          <p className='text-[11px] text-slate-400 font-semibold'>
            Order: {activeOrder?.orderNumber || 'DRAFT (โต๊ะเปิดใหม่)'}
          </p>
        </div>
        <div className='flex items-center space-x-1'>
          {pendingItems.length > 0 && (
            <span className='px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-500 text-white animate-pulse'>
              รอส่ง {pendingItems.length}
            </span>
          )}
          {sentItems.length > 0 && (
            <span className='px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800'>
              ในครัว {sentItems.length}
            </span>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {showSentSuccess && (
        <div className='bg-emerald-600 text-white p-3 text-xs flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-200'>
          <div className='flex items-center space-x-2'>
            <CheckCircle2 className='w-4 h-4' />
            <span className='font-black'>ส่งรายการเข้าครัว KDS เรียบร้อยแล้ว!</span>
          </div>
          <Link
            href='/kds'
            className='bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1'
          >
            <ChefHat className='w-3 h-3' />
            <span>ดูจอครัว</span>
          </Link>
        </div>
      )}

      {/* Cart Items List */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {items.length === 0 ? (
          <div className='h-48 flex flex-col items-center justify-center text-slate-400 text-center'>
            <ShoppingBag className='w-10 h-10 mb-2 opacity-30 text-slate-400' />
            <p className='text-xs font-bold text-slate-500'>ยังไม่มีรายการอาหาร</p>
            <p className='text-[11px] text-slate-400 mt-0.5'>แตะเมนูก๋วยเตี๋ยวหรืออาหารทางซ้ายเพื่อสั่ง</p>
          </div>
        ) : (
          <>
            {/* 1. Pending Items (New orders waiting to be sent) */}
            {pendingItems.length > 0 && (
              <div className='space-y-2'>
                <div className='text-[11px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1'>
                  <span className='w-2 h-2 rounded-full bg-amber-500' />
                  <span>รายการใหม่ที่รอส่งครัว ({pendingItems.length})</span>
                </div>
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className='p-3 bg-amber-50/50 rounded-xl border border-amber-300 flex flex-col space-y-1.5 shadow-xs'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 pr-2'>
                        <div className='font-black text-slate-900 text-xs'>{item.productName}</div>
                        {item.modifiers.length > 0 && (
                          <div className='text-[10px] text-amber-900 mt-0.5 font-semibold flex flex-wrap gap-1'>
                            {item.modifiers.map((m, idx) => (
                              <span key={idx} className='bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300'>
                                {m.optionName} {m.price > 0 ? '(+' + m.price + '฿)' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <div className='text-[10px] text-red-600 font-bold italic mt-0.5'>หมายเหตุ: {item.notes}</div>
                        )}
                      </div>
                      <div className='font-black text-slate-900 text-xs'>฿{item.lineTotal.toFixed(2)}</div>
                    </div>

                    <div className='flex items-center justify-between pt-1 border-t border-amber-200/60'>
                      <span className='text-[10px] font-bold text-amber-800'>○ รอยืนยันส่งครัว</span>
                      <div className='flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-0.5'>
                        <button
                          onClick={() => updateOrderItemQty(selectedTableId, item.id, -1)}
                          className='w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600'
                        >
                          <Minus className='w-3 h-3' />
                        </button>
                        <span className='w-5 text-center font-black text-xs'>{item.quantity}</span>
                        <button
                          onClick={() => updateOrderItemQty(selectedTableId, item.id, 1)}
                          className='w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600'
                        >
                          <Plus className='w-3 h-3' />
                        </button>
                        <button
                          onClick={() => removeOrderItem(selectedTableId, item.id)}
                          className='w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-500 ml-1'
                        >
                          <Trash2 className='w-3 h-3' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Sent Items (Already in kitchen / preparing) */}
            {sentItems.length > 0 && (
              <div className='space-y-2 pt-2'>
                <div className='text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between'>
                  <span className='flex items-center gap-1'>
                    <CheckCircle2 className='w-3.5 h-3.5 text-emerald-600' />
                    <span>รายการที่ส่งครัวแล้ว ({sentItems.length})</span>
                  </span>
                  <span className='text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded'>
                    กำลังปรุงใน KDS
                  </span>
                </div>
                {sentItems.map((item) => (
                  <div
                    key={item.id}
                    className='p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center opacity-85'
                  >
                    <div>
                      <div className='font-bold text-slate-800'>
                        {item.productName} <span className='text-amber-800 font-black'>x{item.quantity}</span>
                      </div>
                      {item.modifiers.length > 0 && (
                        <div className='text-[10px] text-slate-500'>{item.modifiers.map((m) => m.optionName).join(', ')}</div>
                      )}
                    </div>
                    <div className='text-right'>
                      <div className='font-black text-slate-900'>฿{item.lineTotal.toFixed(2)}</div>
                      <span className='text-[9px] font-bold text-emerald-700'>● ส่งครัวแล้ว</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart Summary & Send Action */}
      <div className='p-4 border-t border-slate-200 bg-slate-50 space-y-2 text-xs'>
        <div className='flex justify-between text-slate-500'>
          <span>ยอดรวมรายการ (Subtotal)</span>
          <span className='font-bold text-slate-700'>฿{subtotal.toFixed(2)}</span>
        </div>
        <div className='flex justify-between text-slate-500'>
          <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
          <span className='font-bold text-slate-700'>฿{taxTotal.toFixed(2)}</span>
        </div>
        <div className='flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200'>
          <span>ยอดสุทธิ (Grand Total)</span>
          <span className='text-amber-700'>฿{grandTotal.toFixed(2)}</span>
        </div>

        {/* Dynamic Action Button */}
        {pendingItems.length > 0 ? (
          <button
            onClick={handleSend}
            className='w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 shadow-md transition-all mt-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white active:scale-98 cursor-pointer'
          >
            <Send className='w-4 h-4' />
            <span>ส่งรายการใหม่เข้าครัว ({pendingItems.length} รายการ)</span>
          </button>
        ) : sentItems.length > 0 ? (
          <div className='space-y-2 mt-2'>
            <div className='p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5'>
              <CheckCircle2 className='w-4 h-4 text-emerald-600' />
              <span>ส่งเข้าครัวครบทุกรายการแล้ว</span>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <Link
                href='/kds'
                className='py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 text-center'
              >
                <ChefHat className='w-3.5 h-3.5' />
                <span>ดูจอครัว KDS</span>
              </Link>
              <button
                onClick={() => generateBill(selectedTableId)}
                className='py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1'
              >
                <Receipt className='w-3.5 h-3.5' />
                <span>เรียกเช็คบิล</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            disabled
            className='w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 bg-slate-200 text-slate-400 cursor-not-allowed mt-2'
          >
            <ShoppingBag className='w-4 h-4' />
            <span>ยังไม่มีรายการในออเดอร์</span>
          </button>
        )}
      </div>
    </div>
  );
}
