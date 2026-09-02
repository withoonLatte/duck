'use client';

import React from 'react';
import { TableQRCode } from '@/components/pos/qr-code-canvas';

export interface POSReceiptData {
  restaurantName: string;
  branchName: string;
  taxId: string;
  phone: string;
  address: string;
  receiptFooter: string;
  billNumber: string;
  tableNumber: string;
  tableName: string;
  cashierName: string;
  date: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice?: number;
    lineTotal: number;
    modifiers?: string[];
    notes?: string;
  }[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'PROMPTPAY' | 'CREDIT_CARD';
  tenderAmount: number;
  changeDue: number;
  enableVat: boolean;
  wifiSsid?: string;
  wifiPassword?: string;
}

export function POSReceipt({ data }: { data: POSReceiptData }) {
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'เงินสด (Cash)';
      case 'PROMPTPAY':
        return 'พร้อมเพย์ QR (PromptPay)';
      case 'CREDIT_CARD':
        return 'บัตรเครดิต / เดบิต (Card)';
      default:
        return method;
    }
  };

  const beforeTaxAmount = data.enableVat ? data.grandTotal - data.taxTotal : data.subtotal;

  return (
    <div
      id='pos-printable-receipt'
      className='bg-white text-slate-900 font-mono text-[11px] p-4 sm:p-5 rounded-2xl border-2 border-slate-300 w-full max-w-sm mx-auto shadow-sm space-y-2.5 print:border-none print:shadow-none print:p-0 print:w-[76mm]'
    >
      {/* 1. Header & Store Info */}
      <div className='text-center space-y-1 pb-1'>
        <h3 className='font-black text-sm sm:text-base text-slate-950 tracking-tight leading-tight uppercase'>
          {data.restaurantName}
        </h3>
        <p className='text-[10px] text-slate-600 font-bold'>{data.branchName}</p>
        <p className='text-[9.5px] text-slate-500 leading-tight px-2'>{data.address}</p>
        <p className='text-[10px] text-slate-600 font-semibold'>โทร: {data.phone}</p>
        <div className='inline-block px-2 py-0.5 rounded bg-slate-100 text-[9.5px] font-black text-slate-700 mt-0.5'>
          TAX ID: {data.taxId}
        </div>
      </div>

      {/* Document Title */}
      <div className='text-center border-y border-dashed border-slate-300 py-1 font-black text-[11px] text-slate-900'>
        ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ
        <div className='text-[9px] text-slate-500 font-normal'>(TAX INVOICE / RECEIPT - ABB)</div>
      </div>

      {/* 2. Bill & Order Meta */}
      <div className='space-y-0.5 text-[10px] text-slate-700 font-bold'>
        <div className='flex justify-between'>
          <span>เลขที่บิล:</span>
          <span className='font-black text-slate-900'>{data.billNumber}</span>
        </div>
        <div className='flex justify-between'>
          <span>วันที่/เวลา:</span>
          <span>{data.date}</span>
        </div>
        <div className='flex justify-between'>
          <span>โต๊ะ (Table):</span>
          <span className='font-black text-slate-900'>
            {data.tableNumber} ({data.tableName})
          </span>
        </div>
        <div className='flex justify-between'>
          <span>พนักงาน (Cashier):</span>
          <span>{data.cashierName}</span>
        </div>
        <div className='flex justify-between'>
          <span>ประเภท:</span>
          <span>ทานที่ร้าน (Dine-In)</span>
        </div>
      </div>

      {/* 3. Itemized Header */}
      <div className='border-t border-dashed border-slate-300 pt-1.5'>
        <div className='flex justify-between font-black text-[10px] text-slate-900 border-b border-slate-200 pb-1'>
          <span className='flex-1'>รายการ (Item)</span>
          <span className='w-8 text-center'>จน.</span>
          <span className='w-16 text-right'>รวม (฿)</span>
        </div>

        {/* Item List */}
        <div className='divide-y divide-slate-100 py-1 space-y-1.5'>
          {data.items.map((item, idx) => (
            <div key={idx} className='pt-1 text-[10.5px] leading-tight'>
              <div className='flex justify-between items-start'>
                <span className='flex-1 pr-1 font-bold text-slate-900'>
                  {idx + 1}. {item.productName}
                </span>
                <span className='w-8 text-center font-black text-slate-800'>{item.quantity}</span>
                <span className='w-16 text-right font-black text-slate-900'>
                  {item.lineTotal.toFixed(2)}
                </span>
              </div>

              {/* Modifiers breakdown */}
              {item.modifiers && item.modifiers.length > 0 && (
                <div className='text-[9px] text-slate-500 pl-3 pt-0.5 space-y-0.5'>
                  {item.modifiers.map((m, mIdx) => (
                    <div key={mIdx}>+ {m}</div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <div className='text-[9px] text-amber-700 italic pl-3 pt-0.5 font-semibold'>
                  * {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Financial Calculations */}
      <div className='border-t border-dashed border-slate-300 pt-1.5 space-y-1 text-[10.5px] text-slate-700'>
        <div className='flex justify-between'>
          <span>รวมเป็นเงิน (Subtotal):</span>
          <span className='font-bold text-slate-900'>฿{data.subtotal.toFixed(2)}</span>
        </div>

        {data.discountTotal > 0 && (
          <div className='flex justify-between text-[#D9531E] font-bold'>
            <span>ส่วนลด (Discount):</span>
            <span>-฿{data.discountTotal.toFixed(2)}</span>
          </div>
        )}

        {data.enableVat && (
          <>
            <div className='flex justify-between text-slate-500 text-[9.5px]'>
              <span>มูลค่าก่อนภาษี (Pre-Tax):</span>
              <span>฿{beforeTaxAmount.toFixed(2)}</span>
            </div>
            <div className='flex justify-between text-slate-500 text-[9.5px]'>
              <span>ภาษีมูลค่าเพิ่ม VAT 7% (รวมในราคา):</span>
              <span>฿{data.taxTotal.toFixed(2)}</span>
            </div>
          </>
        )}

        <div className='flex justify-between items-center font-black text-xs sm:text-sm text-slate-950 pt-1.5 border-t border-slate-300'>
          <span>ยอดสุทธิ (GRAND TOTAL):</span>
          <span className='text-sm sm:text-base font-black text-slate-950'>
            ฿{data.grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 5. Payment Details */}
      <div className='border-t border-dashed border-slate-300 pt-1.5 space-y-0.5 text-[10px] text-slate-700 font-bold'>
        <div className='flex justify-between'>
          <span>วิธีชำระ (Payment):</span>
          <span className='font-black text-slate-900'>{getPaymentMethodLabel(data.paymentMethod)}</span>
        </div>

        {data.paymentMethod === 'CASH' && (
          <>
            <div className='flex justify-between'>
              <span>รับเงินมา (Tendered):</span>
              <span className='font-bold text-slate-900'>฿{data.tenderAmount.toFixed(2)}</span>
            </div>
            <div className='flex justify-between font-black text-slate-900 pt-0.5'>
              <span>เงินทอน (Change Due):</span>
              <span className='text-emerald-700 text-xs font-black'>
                ฿{data.changeDue.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 6. Footer & Wi-Fi & QR */}
      <div className='border-t border-dashed border-slate-300 pt-2 text-center space-y-1 text-[9.5px] text-slate-600'>
        {data.enableVat && <div className='font-bold text-slate-700'>* ราคารวมภาษีมูลค่าเพิ่มแล้ว *</div>}
        <div className='font-bold text-slate-800 text-[10px]'>{data.receiptFooter}</div>

        {(data.wifiSsid || data.wifiPassword) && (
          <div className='bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[9px] font-semibold text-slate-600 my-1'>
            📶 Wi-Fi: <span className='font-bold text-slate-900'>{data.wifiSsid || 'DuckNoodle-Free'}</span> | Pass: <span className='font-bold text-slate-900'>{data.wifiPassword || '88888888'}</span>
          </div>
        )}

        <div className='pt-1 flex flex-col items-center justify-center'>
          <TableQRCode
            value={`https://ducknoodle.pos/receipt/${data.billNumber}`}
            size={70}
            tableNumber='E-Receipt'
            showDownload={false}
          />
          <div className='text-[8.5px] text-slate-400 font-bold mt-1'>สแกนเพื่อดู E-Receipt ออนไลน์</div>
        </div>
      </div>
    </div>
  );
}
