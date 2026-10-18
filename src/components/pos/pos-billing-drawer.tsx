'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurant, StoreBill } from '@/lib/store/restaurant-store';
import { TableQRCode } from '@/components/pos/qr-code-canvas';
import { POSReceipt, POSReceiptData } from '@/components/pos/pos-receipt';
import { printReceiptElement } from '@/lib/utils/print-receipt';
import { 
  X, 
  AlertCircle, 
  Receipt, 
  CheckCircle2, 
  CreditCard, 
  Coins, 
  Smartphone, 
  Printer, 
  Percent, 
  ArrowRight
} from 'lucide-react';

interface POSBillingDrawerProps {
  table: {
    id: string;
    number: string;
    name: string;
    currentOrderId?: string;
  };
  onClose: () => void;
}

export function POSBillingDrawer({ table, onClose }: POSBillingDrawerProps) {
  const { 
    bills, 
    orders,
    restaurantSettings, 
    activeRole,
    generateBill, 
    applyDiscount, 
    processPayment 
  } = useRestaurant();

  // Find active bill for this table
  let activeBill = bills.find(
    (b) => (b.tableNumber === table.number || b.tableNumber === table.id) && (b.status === 'OPEN' || b.status === 'PARTIALLY_PAID')
  );

  const activeOrder = orders.find(
    (o) => (o.tableId === table.id || o.tableNumber === table.number) && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );

  // Auto-generate bill on open if order exists but bill doesn't yet
  useEffect(() => {
    if (!activeBill && activeOrder && activeOrder.items.length > 0) {
      generateBill(table.id);
    }
  }, [activeBill, activeOrder, table.id]);

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'PROMPTPAY' | 'CREDIT_CARD'>('CASH');
  const [tenderAmount, setTenderAmount] = useState<number>(0);
  const [receiptData, setReceiptData] = useState<POSReceiptData | null>(null);

  const currentGrandTotal = activeBill ? activeBill.grandTotal : (activeOrder ? activeOrder.grandTotal : 0);
  const changeDue = Math.max(0, tenderAmount - currentGrandTotal);

  const handleApplyDiscountPercent = (pct: number) => {
    if (!activeBill) return;
    const amount = (activeBill.subtotal * pct) / 100;
    applyDiscount(activeBill.id, amount, `ส่วนลด ${pct}%`);
  };

  const getCashierLabel = () => {
    switch (activeRole) {
      case 'OWNER':
        return 'คุณวิทย์ (เจ้าของร้าน)';
      case 'MANAGER':
        return 'สมชาย (ผู้จัดการ)';
      case 'CASHIER':
        return 'แคชเชียร์ 1';
      default:
        return `พนักงาน (${activeRole})`;
    }
  };

  const handlePay = () => {
    const currentBill = activeBill || (activeOrder ? {
      id: generateBill(table.id),
      billNumber: 'B-' + Math.floor(1000 + Math.random() * 9000),
      items: activeOrder.items.map((i) => ({
        id: i.id,
        productName: i.productName,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
        modifiers: i.modifiers.map((m) => m.optionName),
      })),
      subtotal: activeOrder.subtotal,
      discountTotal: activeOrder.discountTotal,
      taxTotal: activeOrder.taxTotal,
      grandTotal: activeOrder.grandTotal,
    } as any : null);

    if (!currentBill) return;

    const tendered = paymentMethod === 'CASH' ? (tenderAmount > 0 ? tenderAmount : currentBill.grandTotal) : currentBill.grandTotal;
    const res = processPayment(currentBill.id, paymentMethod, currentBill.grandTotal, tendered);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Prepare complete rich receipt data snapshot
    const receiptSnapshot: POSReceiptData = {
      restaurantName: restaurantSettings.name,
      branchName: restaurantSettings.branchName,
      taxId: restaurantSettings.taxId,
      phone: restaurantSettings.phone,
      address: restaurantSettings.address,
      receiptFooter: restaurantSettings.receiptFooter,
      billNumber: currentBill.billNumber,
      tableNumber: table.number,
      tableName: table.name,
      cashierName: getCashierLabel(),
      date: formattedDate,
      items: currentBill.items || activeOrder?.items.map((i) => ({
        id: i.id,
        productName: i.productName,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
        modifiers: i.modifiers.map((m) => m.optionName),
        notes: i.notes,
      })) || [],
      subtotal: currentBill.subtotal,
      discountTotal: currentBill.discountTotal || 0,
      taxTotal: currentBill.taxTotal,
      grandTotal: currentBill.grandTotal,
      paymentMethod,
      tenderAmount: tendered,
      changeDue: res.changeDue,
      enableVat: restaurantSettings.enableVat,
      wifiSsid: restaurantSettings.wifiSsid,
      wifiPassword: restaurantSettings.wifiPassword,
    };

    setReceiptData(receiptSnapshot);
  };

  const handlePrint = () => {
    if (receiptData) {
      printReceiptElement(receiptData);
    } else {
      window.print();
    }
  };

  return (
    <div className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-stretch justify-end z-50 animate-in fade-in duration-200'>
      <div className='bg-[#F4F6F5] w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300'>
        {/* Top Header */}
        <div className='p-3.5 sm:p-4 bg-[#0C3B2E] text-white arch-header flex items-center justify-between shadow-md shrink-0 no-print'>
          <div className='flex items-center space-x-2.5 sm:space-x-3'>
            <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#D9531E] flex items-center justify-center text-white font-black text-sm shadow-md shrink-0'>
              <Receipt className='w-5 h-5' />
            </div>
            <div>
              <h3 className='font-black text-sm sm:text-base text-white flex items-center gap-1.5'>
                <span>เช็คบิล & ชำระเงิน: {table.name}</span>
              </h3>
              <p className='text-[10px] sm:text-[11px] text-emerald-200/80 font-medium'>
                {activeBill ? `เลขที่บิล: ${activeBill.billNumber}` : `ยอดรวม: ฿${currentGrandTotal.toFixed(2)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 cursor-pointer'
          >
            <X className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>
        </div>

        {/* Content Body */}
        {receiptData ? (
          /* Payment Success & Full Detailed Thermal Receipt Preview */
          <div className='p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col items-center text-center space-y-4 animate-in fade-in'>
            <div className='no-print flex flex-col items-center space-y-2'>
              <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#84CC16] text-[#072E20] flex items-center justify-center shadow-lg animate-bounce'>
                <CheckCircle2 className='w-7 h-7' />
              </div>
              <h3 className='text-lg sm:text-xl font-black text-slate-900'>ชำระเงินสำเร็จเรียบร้อย!</h3>
              <p className='text-[11px] sm:text-xs text-slate-500 font-medium'>
                บันทึกบัญชี Dr/Cr และเคลียร์สถานะโต๊ะ {table.number} เรียบร้อยแล้ว
              </p>
            </div>

            {/* Change Due Callout */}
            {receiptData.paymentMethod === 'CASH' && receiptData.changeDue > 0 && (
              <div className='no-print bg-emerald-50 rounded-2xl p-3 border border-emerald-300 w-full max-w-sm text-center'>
                <span className='text-xs font-bold text-emerald-800'>เงินทอน (Change Due):</span>
                <div className='text-2xl font-black text-[#0C3B2E] mt-0.5'>฿{receiptData.changeDue.toFixed(2)}</div>
              </div>
            )}

            {/* FULL COMPLETE THERMAL RECEIPT SLIP */}
            <div className='w-full max-w-sm'>
              <POSReceipt data={receiptData} />
            </div>

            {/* Print & Finish Actions */}
            <div className='no-print flex items-center gap-2 w-full max-w-sm pt-2'>
              <button
                onClick={handlePrint}
                className='flex-1 py-3.5 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer'
              >
                <Printer className='w-4 h-4 text-[#84CC16]' />
                <span>🖨️ พิมพ์ใบเสร็จ (Print)</span>
              </button>
              <button
                onClick={onClose}
                className='px-5 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer active:scale-95'
              >
                เสร็จสิ้น (Close)
              </button>
            </div>
          </div>
        ) : !activeBill && (!activeOrder || activeOrder.items.length === 0) ? (
          <div className='p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4'>
            <Receipt className='w-12 h-12 text-slate-300' />
            <h4 className='font-black text-base text-slate-800'>ยังไม่มีรายการอาหารในโต๊ะ {table.number}</h4>
            <p className='text-xs text-slate-500 max-w-xs'>
              กรุณากดสั่งอาหารที่โต๊ะนี้ก่อนเพื่อเริ่มขั้นตอนการเช็คบิล
            </p>
            <button
              onClick={onClose}
              className='px-6 py-3 bg-[#0C3B2E] text-white font-black rounded-2xl text-xs shadow-md cursor-pointer'
            >
              ปิดหน้าต่าง
            </button>
          </div>
        ) : (
          /* Billing & Payment Form */
          <div className='p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs'>
            {/* Bill Summary Card */}
            <div className='bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3'>
              <div className='flex justify-between items-center font-black border-b border-slate-100 pb-2 text-slate-900'>
                <span>รายการอาหาร ({activeBill ? activeBill.items.length : activeOrder?.items.length} รายการ)</span>
                <span className='text-[#D9531E] font-black text-sm'>฿{currentGrandTotal.toFixed(2)}</span>
              </div>

              <div className='space-y-1.5 max-h-40 overflow-y-auto pr-1'>
                {(activeBill?.items || activeOrder?.items || []).map((it, idx) => (
                  <div key={idx} className='flex justify-between items-center text-slate-700 text-xs'>
                    <div>
                      <span className='font-bold text-slate-900'>{it.productName} x{it.quantity}</span>
                    </div>
                    <span className='font-black text-slate-900'>฿{it.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className='pt-2 border-t border-slate-100 space-y-1 text-slate-600'>
                <div className='flex justify-between'>
                  <span>ยอดรวม (Subtotal):</span>
                  <span className='font-bold text-slate-900'>฿{(activeBill?.subtotal || activeOrder?.subtotal || 0).toFixed(2)}</span>
                </div>
                {activeBill && activeBill.discountTotal > 0 && (
                  <div className='flex justify-between text-[#D9531E] font-bold'>
                    <span>ส่วนลด (Discount):</span>
                    <span>-฿{activeBill.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                {restaurantSettings.enableVat && (
                  <div className='flex justify-between text-slate-500'>
                    <span>VAT 7% (รวมในราคา):</span>
                    <span>฿{(activeBill?.taxTotal || activeOrder?.taxTotal || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className='flex justify-between items-center font-black text-sm text-slate-900 pt-1 border-t border-slate-200'>
                  <span>ยอดสุทธิที่ต้องชำระ:</span>
                  <span className='text-base font-black text-[#D9531E]'>฿{currentGrandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Discount Buttons */}
            <div className='bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200 shadow-sm space-y-2'>
              <span className='font-black text-slate-800 flex items-center gap-1.5'>
                <Percent className='w-4 h-4 text-[#0C3B2E]' />
                <span>ให้ส่วนลด (Discount):</span>
              </span>
              <div className='grid grid-cols-4 gap-1.5 sm:gap-2'>
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleApplyDiscountPercent(pct)}
                    className='py-2 bg-slate-50 hover:bg-[#0C3B2E] hover:text-white rounded-xl border border-slate-200 font-black text-slate-700 text-xs transition-colors cursor-pointer active:scale-95'
                  >
                    ลด {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className='bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200 shadow-sm space-y-3'>
              <span className='font-black text-slate-800 block'>เลือกวิธีชำระเงิน:</span>
              <div className='grid grid-cols-3 gap-2'>
                <button
                  onClick={() => setPaymentMethod('CASH')}
                  className={
                    'py-2.5 sm:py-3 rounded-2xl font-black text-xs flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-95 ' +
                    (paymentMethod === 'CASH'
                      ? 'bg-[#0C3B2E] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100')
                  }
                >
                  <Coins className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span>เงินสด</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('PROMPTPAY')}
                  className={
                    'py-2.5 sm:py-3 rounded-2xl font-black text-xs flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-95 ' +
                    (paymentMethod === 'PROMPTPAY'
                      ? 'bg-[#0C3B2E] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100')
                  }
                >
                  <Smartphone className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span>พร้อมเพย์ QR</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={
                    'py-2.5 sm:py-3 rounded-2xl font-black text-xs flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-95 ' +
                    (paymentMethod === 'CREDIT_CARD'
                      ? 'bg-[#0C3B2E] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100')
                  }
                >
                  <CreditCard className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span>บัตรเครดิต</span>
                </button>
              </div>

              {/* Cash Quick Tender Calculator (Accumulating Banknotes) */}
              {paymentMethod === 'CASH' && (
                <div className='pt-2 space-y-2.5 animate-in fade-in'>
                  <div className='flex justify-between items-center font-bold text-slate-700 bg-slate-50 p-2 rounded-2xl border border-slate-200'>
                    <span className='text-xs font-black text-slate-900'>จำนวนเงินที่รับมา (บาท):</span>
                    <div className='flex items-center space-x-1.5'>
                      <input
                        type='number'
                        value={tenderAmount || ''}
                        onChange={(e) => setTenderAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder={currentGrandTotal.toFixed(2)}
                        className='w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-right font-black text-base text-slate-900 focus:outline-[#0C3B2E] shadow-xs'
                      />
                      {tenderAmount > 0 && (
                        <button
                          type='button'
                          onClick={() => setTenderAmount(0)}
                          className='px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer'
                          title='ล้างจำนวนเงิน'
                        >
                          ล้าง
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Banknotes Quick Tap (Adds to total) */}
                  <div className='space-y-1.5'>
                    <div className='text-[10px] font-bold text-slate-400 flex items-center justify-between'>
                      <span>แตะธนบัตรเพื่อบวกเพิ่มตามจำนวนที่รับ:</span>
                      {tenderAmount > 0 && (
                        <span className='text-emerald-700 font-bold'>ยอดปัจจุบัน: ฿{tenderAmount.toLocaleString()}</span>
                      )}
                    </div>
                    <div className='grid grid-cols-4 sm:grid-cols-7 gap-1.5'>
                      <button
                        type='button'
                        onClick={() => setTenderAmount(currentGrandTotal)}
                        className='py-2 px-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl font-black text-xs text-emerald-900 shadow-2xs transition-transform active:scale-95 cursor-pointer text-center'
                      >
                        พอดี
                      </button>
                      <button
                        type='button'
                        onClick={() => setTenderAmount((prev) => prev + 20)}
                        className='py-2 px-1 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-300 rounded-xl font-black text-xs text-emerald-800 shadow-2xs transition-transform active:scale-95 cursor-pointer text-center'
                      >
                        +20
                      </button>
                      <button
                        type='button'
                        onClick={() => setTenderAmount((prev) => prev + 50)}
                        className='py-2 px-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-xl font-black text-xs text-sky-800 shadow-2xs transition-transform active:scale-95 cursor-pointer text-center'
                      >
                        +50
                      </button>
                      <button
                        type='button'
                        onClick={() => setTenderAmount((prev) => prev + 100)}
                        className='py-2 px-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl font-black text-xs text-rose-800 shadow-2xs transition-transform active:scale-95 cursor-pointer text-center'
                      >
                        +100
                      </button>
                      <button
                        type='button'
                        onClick={() => setTenderAmount((prev) => prev + 500)}
                        className='py-2 px-1 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-xl font-black text-xs text-purple-800 shadow-2xs transition-transform active:scale-95 cursor-pointer text-center'
                      >
                        +500
                      </button>
                      <button
                        type='button'
                        onClick={() => setTenderAmount((prev) => prev + 1000)}
                        className='py-2 px-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl font-black text-xs text-amber-900 shadow-2xs transition-transform active:scale-95 cursor-pointer text-center'
                      >
                        +1,000
                      </button>
                      <button
                        type='button'
                        onClick={() => setTenderAmount(0)}
                        className='py-2 px-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 shadow-2xs transition-transform active:scale-95 cursor-pointer text-center'
                      >
                        ล้าง (C)
                      </button>
                    </div>
                  </div>

                  {/* Change Due or Shortage Alert */}
                  {tenderAmount > 0 ? (
                    tenderAmount >= currentGrandTotal ? (
                      <div className='p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-400 flex justify-between items-center font-black text-[#0C3B2E] shadow-xs animate-in fade-in'>
                        <div className='flex items-center gap-1.5'>
                          <CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0' />
                          <span className='text-xs sm:text-sm'>เงินทอน (Change Due):</span>
                        </div>
                        <span className='text-xl sm:text-2xl font-black text-emerald-800'>
                          ฿{(tenderAmount - currentGrandTotal).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className='p-3.5 bg-rose-50 rounded-2xl border-2 border-rose-400 flex justify-between items-center font-black text-rose-950 shadow-xs animate-in fade-in'>
                        <div className='flex items-center gap-1.5'>
                          <AlertCircle className='w-4 h-4 text-rose-600 shrink-0' />
                          <div>
                            <span className='text-xs sm:text-sm font-black'>ยังขาดอีก (เงินยังไม่พอยอดบิล):</span>
                            <div className='text-[10px] text-rose-600 font-medium'>ยอดบิล ฿{currentGrandTotal.toFixed(2)} • รับมา ฿{tenderAmount.toFixed(2)}</div>
                          </div>
                        </div>
                        <span className='text-lg sm:text-xl font-black text-rose-700'>
                          -฿{(currentGrandTotal - tenderAmount).toFixed(2)}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className='p-3 bg-slate-100 rounded-2xl border border-slate-200 flex justify-between items-center font-bold text-slate-600 text-xs'>
                      <span>แตะธนบัตรที่รับมา หรือกดปุ่ม &quot;พอดี&quot;</span>
                      <span className='font-black text-slate-800'>ยอดชำระ: ฿{currentGrandTotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* PromptPay Dynamic QR View */}
              {paymentMethod === 'PROMPTPAY' && (
                <div className='pt-2 flex flex-col items-center text-center space-y-2 animate-in fade-in bg-blue-50/50 p-4 rounded-2xl border border-blue-200'>
                  <span className='px-3 py-0.5 rounded-full bg-[#003D6B] text-white font-black text-[10px]'>
                    สแกน QR เพื่อชำระ ฿{currentGrandTotal.toFixed(2)}
                  </span>
                  <TableQRCode
                    value={`promptpay:${restaurantSettings.promptPayId || '0812345678'}?amount=${currentGrandTotal}`}
                    size={140}
                    tableNumber='PromptPay'
                    showDownload={false}
                  />
                  <span className='text-[10px] text-slate-500 font-bold'>
                    พร้อมเพย์: {restaurantSettings.promptPayId || '081-234-5678'} ({restaurantSettings.name})
                  </span>
                </div>
              )}
            </div>

            {/* Submit Payment Button */}
            <button
              onClick={handlePay}
              disabled={paymentMethod === 'CASH' && tenderAmount > 0 && tenderAmount < currentGrandTotal}
              className={
                'w-full py-3.5 sm:py-4 font-black rounded-2xl text-sm flex items-center justify-center space-x-2 shadow-xl transition-transform active:scale-95 cursor-pointer ' +
                (paymentMethod === 'CASH' && tenderAmount > 0 && tenderAmount < currentGrandTotal
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20]')
              }
            >
              <CheckCircle2 className='w-5 h-5' />
              <span>
                {paymentMethod === 'CASH' && tenderAmount > 0 && tenderAmount < currentGrandTotal
                  ? `เงินยังไม่พอ (ขาดอีก ฿${(currentGrandTotal - tenderAmount).toFixed(2)})`
                  : paymentMethod === 'CASH' && tenderAmount > currentGrandTotal
                  ? `ยืนยันรับเงิน ฿${tenderAmount.toFixed(2)} (ทอน ฿${(tenderAmount - currentGrandTotal).toFixed(2)})`
                  : `ยืนยันรับชำระเงิน ฿${currentGrandTotal.toFixed(2)}`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
