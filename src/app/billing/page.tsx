'use client';

import React, { useState } from 'react';
import { useRestaurant, StoreBill } from '@/lib/store/restaurant-store';
import { SplitBillModal } from '@/components/billing/split-bill-modal';
import { PaymentModal } from '@/components/billing/payment-modal';
import { Receipt, Scissors, CreditCard, Tag, PlusCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const { bills, tables, generateBill, applyDiscount } = useRestaurant();
  const [selectedSplitBill, setSelectedSplitBill] = useState<StoreBill | null>(null);
  const [selectedPayBill, setSelectedPayBill] = useState<StoreBill | null>(null);

  const openBills = bills.filter((b) => b.status === 'OPEN' || b.status === 'PARTIALLY_PAID');
  const paidBills = bills.filter((b) => b.status === 'PAID');

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col space-y-6'>
      {/* Header Banner with Geometric Background from Image 2 */}
      <div 
        className='relative rounded-3xl p-6 sm:p-7 text-white shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-cyan-300/40'
        style={{
          backgroundImage: "linear-gradient(to right, rgba(0, 30, 45, 0.72) 0%, rgba(0, 40, 50, 0.45) 50%, rgba(0, 0, 0, 0.2) 100%), url('/images/banner-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='relative z-10'>
          <div className='inline-flex items-center space-x-2 px-3 py-1 bg-black/35 backdrop-blur-md rounded-full text-xs font-black text-[#84CC16] border border-white/20 mb-2 shadow-xs'>
            <Receipt className='w-4 h-4 text-[#84CC16]' />
            <span>BILLING, SETTLEMENTS & SPLIT BILL</span>
          </div>
          <h2 className='text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md'>
            ระบบเช็คบิล & แยกบิลชำระเงิน
          </h2>
          <p className='text-white/90 text-xs sm:text-sm mt-1 font-semibold drop-shadow-sm max-w-2xl'>
            แยกบิลตามรายการอาหาร, หารเท่าตามจำนวนคน, ให้ส่วนลด และรับชำระเงิน Multi-Tender
          </p>
        </div>

        {/* Quick Trigger to Generate Bill from Occupied Table */}
        <div className='relative z-10 flex items-center gap-2 flex-wrap'>
          {tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED').map((t) => (
            <button
              key={t.id}
              onClick={() => generateBill(t.id)}
              className='px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/25 rounded-2xl text-xs font-black text-white shadow-md transition-all active:scale-95 cursor-pointer'
            >
              + เปิดบิล {t.number}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Open Bills (Left) & Settled Bills History (Right) */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1'>
        {/* Open Bills (2 cols) */}
        <div className='lg:col-span-2 space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='font-black text-slate-900 text-base flex items-center gap-2'>
              <span>บิลที่รอชำระเงิน (Open Bills)</span>
              <span className='px-2.5 py-0.5 rounded-full text-xs font-black bg-[#D9531E] text-white'>
                {openBills.length}
              </span>
            </h3>
          </div>

          {openBills.length === 0 ? (
            <div className='bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400'>
              <Receipt className='w-12 h-12 mx-auto mb-2 opacity-30 text-[#0C3B2E]' />
              <p className='text-xs font-bold text-slate-700'>ไม่มีบิลค้างชำระในขณะนี้</p>
              <p className='text-[11px] text-slate-400 mt-0.5'>
                กดเรียกเช็คบิลจากหน้า <Link href='/pos' className='text-[#D9531E] font-black underline'>POS ผังโต๊ะ</Link> ได้ทันที
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {openBills.map((bill) => (
                <div
                  key={bill.id}
                  className='bg-white rounded-3xl border-2 border-slate-200/90 p-5 shadow-sm hover:border-[#0C3B2E] transition-all flex flex-col justify-between'
                >
                  <div>
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex items-center space-x-2'>
                        <span className='w-9 h-9 rounded-2xl bg-[#0C3B2E] text-white font-black text-xs flex items-center justify-center'>
                          {bill.tableNumber}
                        </span>
                        <div>
                          <h4 className='font-black text-slate-900 text-sm leading-tight'>{bill.billNumber}</h4>
                          <span className='text-[10px] text-slate-400 font-semibold'>
                            {new Date(bill.createdAt).toLocaleTimeString('th-TH')}
                          </span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <span className='text-[10px] text-slate-400 font-bold block'>ยอดค้างชำระ</span>
                        <span className='text-lg font-black text-[#D9531E]'>฿{bill.balanceDue.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className='bg-slate-50/80 rounded-2xl p-3 border border-slate-100 text-xs space-y-1.5 mb-4'>
                      {bill.items.map((i, idx) => (
                        <div key={idx} className='flex justify-between text-slate-700 font-medium'>
                          <span>{i.productName} x{i.quantity}</span>
                          <span className='font-black text-slate-900'>฿{i.lineTotal.toFixed(2)}</span>
                        </div>
                      ))}
                      {bill.discountTotal > 0 && (
                        <div className='flex justify-between text-red-600 font-black pt-1 border-t border-slate-200'>
                          <span>ส่วนลดพิเศษ:</span>
                          <span>-฿{bill.discountTotal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='pt-3 border-t border-slate-100 flex flex-col gap-2'>
                    <div className='grid grid-cols-2 gap-2'>
                      <button
                        onClick={() => setSelectedSplitBill(bill)}
                        className='py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 font-black text-xs text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer'
                      >
                        <Scissors className='w-3.5 h-3.5 text-[#0C3B2E]' />
                        <span>แยกบิล (Split)</span>
                      </button>
                      <button
                        onClick={() => applyDiscount(bill.id, 20, 'โปรโมชั่นเปิดร้าน')}
                        className='py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 font-black text-xs text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer'
                      >
                        <Tag className='w-3.5 h-3.5 text-[#D9531E]' />
                        <span>ลด 20฿</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedPayBill(bill)}
                      className='w-full py-3 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-black rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-transform active:scale-98 cursor-pointer'
                    >
                      <CreditCard className='w-4 h-4' />
                      <span>รับชำระเงิน (Checkout ฿{bill.balanceDue.toFixed(2)})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settled Bills History (1 col) */}
        <div className='space-y-4'>
          <h3 className='font-black text-slate-900 text-base'>ประวัติบิลที่ชำระแล้ว (Paid History)</h3>
          <div className='bg-white rounded-3xl border border-slate-200 p-4 space-y-3 max-h-[600px] overflow-y-auto'>
            {paidBills.length === 0 ? (
              <p className='text-xs text-slate-400 text-center py-8'>ยังไม่มีประวัติการชำระเงิน</p>
            ) : (
              paidBills.map((b) => (
                <div key={b.id} className='p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1'>
                  <div className='flex justify-between items-center font-black text-slate-900'>
                    <span>{b.billNumber} ({b.tableNumber})</span>
                    <span className='text-emerald-700'>฿{b.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className='text-[10px] text-slate-400 font-semibold'>
                    ชำระเมื่อ {new Date(b.createdAt).toLocaleTimeString('th-TH')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Split Modal */}
      {selectedSplitBill && (
        <SplitBillModal bill={selectedSplitBill} onClose={() => setSelectedSplitBill(null)} />
      )}

      {/* Payment Modal */}
      {selectedPayBill && (
        <PaymentModal bill={selectedPayBill} onClose={() => setSelectedPayBill(null)} />
      )}
    </div>
  );
}
