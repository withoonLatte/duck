'use client';

import React, { useState } from 'react';
import { useRestaurant, StoreBill } from '@/lib/store/restaurant-store';
import { X, Banknote, QrCode, CreditCard, CheckCircle2, RotateCcw, ShieldAlert, ArrowLeft } from 'lucide-react';

interface PaymentModalProps {
  bill: StoreBill;
  onClose: () => void;
}

export function PaymentModal({ bill, onClose }: PaymentModalProps) {
  const { processPayment, processRefund } = useRestaurant();
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'PROMPTPAY' | 'CREDIT_CARD'>('PROMPTPAY');
  const [tenderAmount, setTenderAmount] = useState<number>(bill.balanceDue);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [changeDueResult, setChangeDueResult] = useState(0);
  const [paymentIdResult, setPaymentIdResult] = useState('');

  // Refund state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [managerPin, setManagerPin] = useState('');
  const [refundReason, setRefundReason] = useState('ลูกค้าขอยกเลิกรายการ / สั่งผิด');
  const [refundError, setRefundError] = useState('');

  const quickCashOptions = [
    bill.balanceDue,
    Math.ceil(bill.balanceDue / 100) * 100,
    500,
    1000,
  ].filter((v, idx, arr) => arr.indexOf(v) === idx && v >= bill.balanceDue);

  const handlePay = () => {
    const res = processPayment(bill.id, paymentMethod, bill.balanceDue, tenderAmount);
    if (res.success) {
      setChangeDueResult(res.changeDue);
      setPaymentIdResult(res.paymentId);
      setPaymentCompleted(true);
    }
  };

  const handleRefundSubmit = () => {
    const res = processRefund(paymentIdResult, refundReason, managerPin);
    if (!res.success) {
      setRefundError(res.error || 'รหัสผ่านผิด');
    } else {
      setShowRefundModal(false);
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200'>
      <div className='bg-white rounded-4xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col'>
        {/* Curved Header */}
        <div className='p-4 pt-5 bg-[#0C3B2E] text-white arch-header flex items-center justify-between shadow-sm'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-full bg-[#84CC16] text-[#072E20] flex items-center justify-center font-black shadow-md'>
              <Banknote className='w-5 h-5' />
            </div>
            <div>
              <h3 className='text-base font-black text-white'>
                {paymentCompleted ? 'ใบเสร็จรับเงิน (Receipt Issued)' : 'รับชำระเงิน (Checkout)'}
              </h3>
              <p className='text-[11px] text-emerald-200/80 font-medium'>
                บิล: {bill.billNumber} • โต๊ะ {bill.tableNumber}
              </p>
            </div>
          </div>
          <button onClick={onClose} className='w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        {!paymentCompleted ? (
          <div className='p-6 space-y-5 text-xs'>
            {/* Amount Due Banner */}
            <div className='bg-gradient-to-r from-[#D9531E] to-[#B45309] text-white p-5 rounded-3xl shadow-md text-center'>
              <span className='text-amber-100 font-bold block text-xs mb-1'>ยอดที่ต้องชำระ (Balance Due)</span>
              <span className='text-3xl sm:text-4xl font-black'>฿{bill.balanceDue.toFixed(2)}</span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className='font-black text-slate-800 mb-2 block'>เลือกวิธีชำระเงิน:</label>
              <div className='grid grid-cols-3 gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    setPaymentMethod('PROMPTPAY');
                    setTenderAmount(bill.balanceDue);
                  }}
                  className={
                    'p-3.5 rounded-2xl border font-black flex flex-col items-center justify-center gap-1.5 transition-all ' +
                    (paymentMethod === 'PROMPTPAY'
                      ? 'bg-[#0C3B2E] border-[#0C3B2E] text-white shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700')
                  }
                >
                  <QrCode className={'w-5 h-5 ' + (paymentMethod === 'PROMPTPAY' ? 'text-[#84CC16]' : 'text-[#0C3B2E]')} />
                  <span>PromptPay QR</span>
                </button>

                <button
                  type='button'
                  onClick={() => setPaymentMethod('CASH')}
                  className={
                    'p-3.5 rounded-2xl border font-black flex flex-col items-center justify-center gap-1.5 transition-all ' +
                    (paymentMethod === 'CASH'
                      ? 'bg-[#0C3B2E] border-[#0C3B2E] text-white shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700')
                  }
                >
                  <Banknote className={'w-5 h-5 ' + (paymentMethod === 'CASH' ? 'text-[#84CC16]' : 'text-[#0C3B2E]')} />
                  <span>เงินสด (Cash)</span>
                </button>

                <button
                  type='button'
                  onClick={() => {
                    setPaymentMethod('CREDIT_CARD');
                    setTenderAmount(bill.balanceDue);
                  }}
                  className={
                    'p-3.5 rounded-2xl border font-black flex flex-col items-center justify-center gap-1.5 transition-all ' +
                    (paymentMethod === 'CREDIT_CARD'
                      ? 'bg-[#0C3B2E] border-[#0C3B2E] text-white shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700')
                  }
                >
                  <CreditCard className={'w-5 h-5 ' + (paymentMethod === 'CREDIT_CARD' ? 'text-[#84CC16]' : 'text-[#0C3B2E]')} />
                  <span>บัตรเครดิต EDC</span>
                </button>
              </div>
            </div>

            {/* PromptPay QR Simulation */}
            {paymentMethod === 'PROMPTPAY' && (
              <div className='p-4 bg-slate-50 rounded-3xl border border-slate-200 text-center space-y-2'>
                <div className='w-40 h-40 mx-auto bg-white border-2 border-slate-200 rounded-3xl flex items-center justify-center p-3 shadow-inner'>
                  <div className='text-center'>
                    <QrCode className='w-24 h-24 mx-auto text-[#0C3B2E]' />
                    <span className='text-[10px] font-black text-[#0C3B2E] block mt-1'>Thai QR PromptPay</span>
                  </div>
                </div>
                <p className='text-slate-500 font-semibold text-[11px]'>สแกน QR Code ผ่าน Mobile Banking ทุกธนาคาร</p>
              </div>
            )}

            {/* Cash Tender Input */}
            {paymentMethod === 'CASH' && (
              <div className='space-y-3'>
                <div>
                  <label className='font-black text-slate-800 mb-1.5 block'>จำนวนเงินสดที่รับมา:</label>
                  <input
                    type='number'
                    min={bill.balanceDue}
                    value={tenderAmount}
                    onChange={(e) => setTenderAmount(Number(e.target.value))}
                    className='w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xl font-black text-slate-900 text-center focus:bg-white focus:outline-[#0C3B2E]'
                  />
                </div>

                <div className='flex items-center gap-2'>
                  {quickCashOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type='button'
                      onClick={() => setTenderAmount(opt)}
                      className='flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl text-xs'
                    >
                      ฿{opt}
                    </button>
                  ))}
                </div>

                {tenderAmount > bill.balanceDue && (
                  <div className='p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center text-[#0C3B2E] font-black'>
                    <span>เงินทอน (Change Due):</span>
                    <span className='text-xl text-[#0C3B2E]'>฿{(tenderAmount - bill.balanceDue).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Receipt View After Settlement */
          <div className='p-6 space-y-4 text-xs'>
            <div className='p-4 bg-emerald-50 rounded-3xl border border-emerald-200 text-center text-[#0C3B2E]'>
              <CheckCircle2 className='w-10 h-10 text-emerald-600 mx-auto mb-1' />
              <h4 className='font-black text-base'>ชำระเงินสำเร็จ (Payment Completed)</h4>
              <p className='text-xs font-semibold text-emerald-800'>ออกใบเสร็จรับเงินและบันทึกลงบัญชีเรียบร้อย</p>
            </div>

            {/* Receipt Box */}
            <div className='p-4 bg-slate-50 rounded-3xl border border-slate-200 font-mono text-[11px] space-y-2'>
              <div className='text-center border-b border-dashed border-slate-300 pb-2 font-sans'>
                <div className='font-black text-slate-900 text-sm'>ร้านก๋วยเตี๋ยวเป็ดนายเอก</div>
                <div className='text-[10px] text-slate-500'>TAX ID: 0105562001234 • สาขาบรรทัดทอง</div>
              </div>
              <div className='flex justify-between text-slate-600'>
                <span>บิล: {bill.billNumber}</span>
                <span>โต๊ะ: {bill.tableNumber}</span>
              </div>
              <div className='border-b border-dashed border-slate-300 pb-2 space-y-1'>
                {bill.items.map((i, idx) => (
                  <div key={idx} className='flex justify-between'>
                    <span>{i.productName} x{i.quantity}</span>
                    <span>฿{i.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className='flex justify-between font-black text-slate-900 text-xs'>
                <span>ยอดสุทธิ (Grand Total)</span>
                <span className='text-[#D9531E]'>฿{bill.grandTotal.toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-slate-600'>
                <span>ชำระโดย: {paymentMethod}</span>
                <span>รับมา: ฿{tenderAmount.toFixed(2)}</span>
              </div>
              {changeDueResult > 0 && (
                <div className='flex justify-between text-emerald-700 font-black'>
                  <span>เงินทอน (Change Due):</span>
                  <span>฿{changeDueResult.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Manager Refund Action */}
            <div className='pt-1 flex items-center justify-between'>
              <button
                onClick={() => setShowRefundModal(true)}
                className='text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer'
              >
                <RotateCcw className='w-3.5 h-3.5' />
                <span>คืนเงิน / ยกเลิกการชำระ (Manager PIN)</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2'>
          {!paymentCompleted ? (
            <>
              <button
                onClick={onClose}
                className='px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 font-bold text-xs text-slate-700'
              >
                ยกเลิก
              </button>
              <button
                onClick={handlePay}
                className='px-6 py-3 rounded-full bg-[#84CC16] hover:bg-[#65A30D] font-black text-xs text-[#072E20] shadow-md transition-transform active:scale-98 cursor-pointer'
              >
                ยืนยันรับชำระเงิน (฿{bill.balanceDue.toFixed(2)})
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className='px-6 py-3 rounded-full bg-[#0C3B2E] hover:bg-[#072E20] font-black text-xs text-white shadow-md cursor-pointer'
            >
              ปิดหน้าต่าง (Close)
            </button>
          )}
        </div>
      </div>

      {/* Manager Refund Modal */}
      {showRefundModal && (
        <div className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-60'>
          <div className='bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-xs'>
            <div className='flex items-center space-x-2 text-red-600 font-black text-sm'>
              <ShieldAlert className='w-5 h-5' />
              <span>ยืนยันการคืนเงิน (Refund Approval)</span>
            </div>
            <p className='text-slate-500 font-medium'>
              การคืนเงินจะสร้างรายการ Reversal Entry ในสมุดบัญชีและบันทึกลง Audit Log ทันที
            </p>

            <div>
              <label className='font-bold text-slate-700 mb-1 block'>รหัส Manager PIN (กรอก 1234):</label>
              <input
                type='password'
                placeholder='PIN 4 หลัก'
                value={managerPin}
                onChange={(e) => setManagerPin(e.target.value)}
                className='w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl font-bold text-center text-sm focus:bg-white'
              />
            </div>

            <div>
              <label className='font-bold text-slate-700 mb-1 block'>เหตุผลการคืนเงิน:</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className='w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-2xl font-bold text-slate-800'
              >
                <option value='ลูกค้าขอยกเลิกรายการ / สั่งผิด'>ลูกค้าขอยกเลิกรายการ / สั่งผิด</option>
                <option value='อาหารมีปัญหา / รสชาติไม่ได้มาตรฐาน'>อาหารมีปัญหา / รสชาติไม่ได้มาตรฐาน</option>
                <option value='คิดเงินผิดพลาด / คืนส่วนต่าง'>คิดเงินผิดพลาด / คืนส่วนต่าง</option>
              </select>
            </div>

            {refundError && <div className='text-red-600 font-bold text-center'>{refundError}</div>}

            <div className='flex items-center justify-end gap-2 pt-2'>
              <button
                onClick={() => setShowRefundModal(false)}
                className='px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold'
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRefundSubmit}
                className='px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold'
              >
                อนุมัติคืนเงิน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
