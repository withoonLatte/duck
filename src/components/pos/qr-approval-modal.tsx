'use client';

import React from 'react';
import { useRestaurant, StoreOrder } from '@/lib/store/restaurant-store';
import { X, CheckCircle2, XCircle, QrCode, Clock, ArrowRight, Utensils } from 'lucide-react';

interface QRApprovalModalProps {
  order: StoreOrder;
  onClose: () => void;
}

export function QRApprovalModal({ order, onClose }: QRApprovalModalProps) {
  const { approveQROrder, rejectQROrder } = useRestaurant();
  const [rejectReason, setRejectReason] = React.useState('วัตถุดิบบางรายการหมด');
  const [showRejectInput, setShowRejectInput] = React.useState(false);

  const handleApprove = () => {
    approveQROrder(order.id);
    onClose();
  };

  const handleReject = () => {
    rejectQROrder(order.id, rejectReason);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-60 animate-in fade-in duration-200'>
      <div className='bg-white rounded-4xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]'>
        {/* Header */}
        <div className='p-4 pt-5 bg-[#0C3B2E] text-white arch-header flex items-center justify-between shadow-sm'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-full bg-[#84CC16] text-[#072E20] flex items-center justify-center font-black shadow-md animate-pulse'>
              <QrCode className='w-5 h-5' />
            </div>
            <div>
              <h3 className='text-base font-black text-white'>อนุมัติออเดอร์จากลูกค้า (QR Order)</h3>
              <p className='text-[11px] text-emerald-200/80 font-medium'>
                โต๊ะ {order.tableNumber} • รหัส {order.orderNumber}
              </p>
            </div>
          </div>
          <button onClick={onClose} className='w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 cursor-pointer'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content Body */}
        <div className='p-5 overflow-y-auto flex-1 space-y-4 text-xs'>
          <div className='p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between'>
            <div className='flex items-center space-x-2 text-amber-950 font-bold'>
              <Clock className='w-4 h-4 text-amber-600 animate-spin' />
              <span>สั่งเมื่อ: {new Date(order.createdAt).toLocaleTimeString('th-TH')}</span>
            </div>
            <span className='px-2.5 py-0.5 bg-amber-200 text-amber-900 font-black rounded-full text-[10px]'>
              รอ POS อนุมัติ
            </span>
          </div>

          {/* Items Breakdown */}
          <div className='space-y-2'>
            <div className='font-black text-slate-800 flex justify-between items-center'>
              <span>รายการอาหารที่ลูกค้าเลือก ({order.items.length} รายการ):</span>
              <span className='text-slate-400 font-semibold'>{order.customerName}</span>
            </div>
            <div className='bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2.5'>
              {order.items.map((item) => (
                <div key={item.id} className='flex justify-between items-start pb-2 border-b border-slate-200/60 last:border-0 last:pb-0'>
                  <div>
                    <div className='font-black text-slate-900 text-xs'>
                      {item.productName} x{item.quantity}
                    </div>
                    {item.modifiers.length > 0 && (
                      <div className='text-[11px] text-emerald-800 font-medium mt-0.5'>
                        {item.modifiers.map((m) => m.optionName).join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <div className='text-[10px] text-amber-700 italic mt-0.5'>
                        หมายเหตุ: &quot;{item.notes}&quot;
                      </div>
                    )}
                  </div>
                  <span className='font-black text-slate-900'>฿{item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className='p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center text-xs font-black text-[#0C3B2E]'>
            <span>ยอดรวมสุทธิ (Grand Total):</span>
            <span className='text-base text-[#D9531E] font-black'>฿{order.grandTotal.toFixed(2)}</span>
          </div>

          {/* Reject Reason Form */}
          {showRejectInput && (
            <div className='p-3.5 bg-red-50 rounded-2xl border border-red-200 space-y-2 text-xs'>
              <label className='font-bold text-red-950 block'>ระบุเหตุผลที่ปฏิเสธ:</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className='w-full px-3 py-2 bg-white border border-red-300 rounded-xl font-medium text-slate-900'
              >
                <option value='วัตถุดิบบางรายการหมด'>วัตถุดิบบางรายการหมด</option>
                <option value='โต๊ะนี้กำลังจะเช็คบิล'>โต๊ะนี้กำลังจะเช็คบิล</option>
                <option value='ลูกค้ากดยกเลิกที่หน้าร้าน'>ลูกค้ากดยกเลิกที่หน้าร้าน</option>
                <option value='รายการไม่ถูกต้อง'>รายการไม่ถูกต้อง</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className='p-4 border-t border-slate-100 bg-slate-50 space-y-2'>
          {!showRejectInput ? (
            <div className='grid grid-cols-3 gap-2'>
              <button
                onClick={() => setShowRejectInput(true)}
                className='py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer'
              >
                ✕ ปฏิเสธ
              </button>
              <button
                onClick={handleApprove}
                className='col-span-2 py-3 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-black rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95 cursor-pointer'
              >
                <CheckCircle2 className='w-4 h-4' />
                <span>อนุมัติ & ส่งเข้าครัวทันที</span>
              </button>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setShowRejectInput(false)}
                className='flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs'
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                className='flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs'
              >
                ยืนยันปฏิเสธ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
