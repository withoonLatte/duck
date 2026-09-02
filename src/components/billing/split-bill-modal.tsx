'use client';

import React, { useState } from 'react';
import { useRestaurant, StoreBill } from '@/lib/store/restaurant-store';
import { X, Scissors, Users, Check, ArrowRight } from 'lucide-react';

interface SplitBillModalProps {
  bill: StoreBill;
  onClose: () => void;
}

export function SplitBillModal({ bill, onClose }: SplitBillModalProps) {
  const { splitBillByItem, splitBillByAmount } = useRestaurant();
  const [splitMode, setSplitMode] = useState<'BY_ITEM' | 'BY_AMOUNT'>('BY_ITEM');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [partsCount, setPartsCount] = useState<number>(2);

  const toggleItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSplitItem = () => {
    if (selectedItemIds.length === 0) return;
    splitBillByItem(bill.id, selectedItemIds);
    onClose();
  };

  const handleSplitAmount = () => {
    if (partsCount <= 1) return;
    splitBillByAmount(bill.id, partsCount);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200'>
      <div className='bg-white rounded-4xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]'>
        {/* Header */}
        <div className='p-4 pt-5 bg-[#0C3B2E] text-white arch-header flex items-center justify-between shadow-sm'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-full bg-white text-[#0C3B2E] flex items-center justify-center shadow-md'>
              <Scissors className='w-5 h-5' />
            </div>
            <div>
              <h3 className='text-base font-black text-white'>แยกบิลชำระเงิน (Split Bill)</h3>
              <p className='text-[11px] text-emerald-200/80 font-medium'>
                บิล: {bill.billNumber} • โต๊ะ {bill.tableNumber} • ยอด ฿{bill.grandTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className='w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Split Mode Tabs */}
        <div className='p-4 border-b border-slate-100 bg-white grid grid-cols-2 gap-2 text-xs'>
          <button
            onClick={() => setSplitMode('BY_ITEM')}
            className={
              'p-3 rounded-2xl font-black border transition-all flex items-center justify-center gap-2 ' +
              (splitMode === 'BY_ITEM'
                ? 'bg-[#0C3B2E] border-[#0C3B2E] text-white shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50')
            }
          >
            <Scissors className='w-4 h-4' />
            <span>แยกตามรายการอาหาร</span>
          </button>
          <button
            onClick={() => setSplitMode('BY_AMOUNT')}
            className={
              'p-3 rounded-2xl font-black border transition-all flex items-center justify-center gap-2 ' +
              (splitMode === 'BY_AMOUNT'
                ? 'bg-[#0C3B2E] border-[#0C3B2E] text-white shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50')
            }
          >
            <Users className='w-4 h-4' />
            <span>หารเท่าตามจำนวนคน</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className='p-5 overflow-y-auto flex-1 text-xs'>
          {splitMode === 'BY_ITEM' ? (
            <div className='space-y-3'>
              <p className='font-bold text-slate-700'>แตะเลือกรายการที่ต้องการแยกออกเป็นบิลใหม่:</p>
              <div className='space-y-2'>
                {bill.items.map((item) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={
                        'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ' +
                        (isSelected
                          ? 'bg-emerald-50 border-[#0C3B2E] text-[#0C3B2E] font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white')
                      }
                    >
                      <div>
                        <div className='font-black text-xs text-slate-900'>{item.productName} x{item.quantity}</div>
                        {item.modifiers.length > 0 && (
                          <div className='text-[10px] text-slate-500 mt-0.5'>{item.modifiers.join(', ')}</div>
                        )}
                      </div>
                      <div className='flex items-center space-x-3'>
                        <span className='font-black text-[#D9531E]'>฿{item.lineTotal.toFixed(2)}</span>
                        <div
                          className={
                            'w-5 h-5 rounded-full flex items-center justify-center border ' +
                            (isSelected ? 'bg-[#0C3B2E] border-[#0C3B2E] text-white' : 'border-slate-300 bg-white')
                          }
                        >
                          {isSelected && <Check className='w-3 h-3' />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className='space-y-5 py-4 text-center'>
              <label className='font-bold text-slate-700 block text-xs'>เลือกจำนวนคนที่ต้องการหารเท่ากัน:</label>
              <div className='flex items-center justify-center space-x-2.5'>
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPartsCount(num)}
                    className={
                      'w-12 h-12 rounded-2xl font-black text-xs border transition-all ' +
                      (partsCount === num
                        ? 'bg-[#D9531E] border-[#D9531E] text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100')
                    }
                  >
                    {num} คน
                  </button>
                ))}
              </div>
              <div className='p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-[#0C3B2E] font-black text-sm'>
                ยอดเฉลี่ยคนละ ฿{(bill.grandTotal / partsCount).toFixed(2)} ({partsCount} บิลย่อย)
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2'>
          <button
            onClick={onClose}
            className='px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 font-bold text-xs text-slate-700'
          >
            ยกเลิก
          </button>
          <button
            onClick={splitMode === 'BY_ITEM' ? handleSplitItem : handleSplitAmount}
            className='px-6 py-2.5 rounded-2xl bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-black text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-98 cursor-pointer'
          >
            <span>ยืนยันการแยกบิล</span>
            <ArrowRight className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
