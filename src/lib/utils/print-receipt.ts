'use client';

import { POSReceiptData } from '@/components/pos/pos-receipt';

export function printReceiptElement(receiptData: POSReceiptData) {
  if (typeof window === 'undefined') return;

  let iframe = document.getElementById('pos-receipt-print-frame') as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'pos-receipt-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const itemsHtml = receiptData.items.map((item, idx) => `
    <tr style="border-bottom: 1px dashed #cbd5e1;">
      <td style="padding: 5px 0; vertical-align: top;">
        <div style="font-weight: 700; color: #0f172a; font-size: 11px;">${idx + 1}. ${item.productName}</div>
        ${item.modifiers && item.modifiers.length > 0 ? `<div style="font-size: 9.5px; color: #64748b; padding-left: 8px; margin-top: 1px;">+ ${item.modifiers.join(', ')}</div>` : ''}
        ${item.notes ? `<div style="font-size: 9.5px; color: #b45309; padding-left: 8px; margin-top: 1px; font-style: italic;">* ${item.notes}</div>` : ''}
      </td>
      <td style="padding: 5px 4px; text-align: center; vertical-align: top; font-weight: 700; font-size: 11px;">${item.quantity}</td>
      <td style="padding: 5px 0; text-align: right; vertical-align: top; font-weight: 700; font-size: 11px; white-space: nowrap;">${item.lineTotal.toFixed(2)}</td>
    </tr>
  `).join('');

  const paymentLabel = receiptData.paymentMethod === 'CASH' 
    ? 'เงินสด (Cash)' 
    : receiptData.paymentMethod === 'PROMPTPAY' 
    ? 'พร้อมเพย์ QR (PromptPay)' 
    : 'บัตรเครดิต / เดบิต';

  const beforeTax = receiptData.enableVat ? (receiptData.grandTotal - receiptData.taxTotal).toFixed(2) : receiptData.subtotal.toFixed(2);

  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ใบเสร็จรับเงิน_${receiptData.billNumber}</title>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/lazywasabi/thai-web-fonts@main/fonts/LINESeedSansTH/LINESeedSansTH.css');
    @page {
      size: 80mm auto;
      margin: 0mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      font-family: 'LINE Seed Sans TH', 'Prompt', 'Courier New', monospace, sans-serif;
      margin: 0;
      padding: 5mm 4mm;
      width: 72mm;
      max-width: 72mm;
      color: #000000;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.35;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .font-normal { font-weight: 400; }
    .border-dashed { border-top: 1px dashed #475569; margin: 6px 0; }
    .flex-between { display: flex; justify-content: space-between; margin-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 10.5px; }
    th { border-bottom: 1px dashed #475569; padding: 4px 0; font-weight: 700; }
  </style>
</head>
<body>
  <div class="text-center">
    <div style="font-size: 13.5px; font-weight: 800; text-transform: uppercase; line-height: 1.2;">${receiptData.restaurantName}</div>
    <div style="font-size: 10.5px; font-weight: 700; color: #334155; margin-top: 2px;">${receiptData.branchName}</div>
    <div style="font-size: 9.5px; color: #475569; margin-top: 2px; line-height: 1.25;">${receiptData.address}</div>
    <div style="font-size: 10px; color: #334155; margin-top: 1px;">โทร: ${receiptData.phone}</div>
    <div style="font-size: 9.5px; font-weight: 700; margin-top: 3px; display: inline-block; border: 1px solid #94a3b8; padding: 1px 4px; border-radius: 4px;">TAX ID: ${receiptData.taxId}</div>
  </div>

  <div class="border-dashed"></div>
  <div class="text-center font-bold" style="font-size: 11px;">
    ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ
    <div style="font-size: 9px; font-weight: 400; color: #64748b;">(TAX INVOICE / RECEIPT - ABB)</div>
  </div>
  <div class="border-dashed"></div>

  <div style="font-size: 10px;">
    <div class="flex-between"><span>เลขที่บิล:</span><span class="font-bold">${receiptData.billNumber}</span></div>
    <div class="flex-between"><span>วันที่/เวลา:</span><span>${receiptData.date}</span></div>
    <div class="flex-between"><span>โต๊ะ (Table):</span><span class="font-bold">${receiptData.tableNumber} (${receiptData.tableName})</span></div>
    <div class="flex-between"><span>แคชเชียร์:</span><span>${receiptData.cashierName}</span></div>
    <div class="flex-between"><span>ประเภท:</span><span>ทานที่ร้าน (Dine-In)</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align: left;">รายการ (Item)</th>
        <th style="text-align: center; width: 28px;">จน.</th>
        <th style="text-align: right; width: 55px;">รวม (฿)</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="border-dashed"></div>

  <div style="font-size: 10.5px;">
    <div class="flex-between"><span>รวมเป็นเงิน (Subtotal):</span><span class="font-bold">฿${receiptData.subtotal.toFixed(2)}</span></div>
    ${receiptData.discountTotal > 0 ? `<div class="flex-between" style="color: #c2410c; font-weight: 700;"><span>ส่วนลด (Discount):</span><span>-฿${receiptData.discountTotal.toFixed(2)}</span></div>` : ''}
    ${receiptData.enableVat ? `
      <div class="flex-between" style="font-size: 9.5px; color: #64748b;"><span>มูลค่าก่อนภาษี:</span><span>฿${beforeTax}</span></div>
      <div class="flex-between" style="font-size: 9.5px; color: #64748b;"><span>ภาษีมูลค่าเพิ่ม VAT 7%:</span><span>฿${receiptData.taxTotal.toFixed(2)}</span></div>
    ` : ''}
    <div class="border-dashed"></div>
    <div class="flex-between" style="font-size: 13px; font-weight: 800; padding: 2px 0;">
      <span>ยอดสุทธิ (GRAND TOTAL):</span>
      <span>฿${receiptData.grandTotal.toFixed(2)}</span>
    </div>
  </div>

  <div class="border-dashed"></div>

  <div style="font-size: 10px;">
    <div class="flex-between"><span>วิธีชำระ (Payment):</span><span class="font-bold">${paymentLabel}</span></div>
    ${receiptData.paymentMethod === 'CASH' ? `
      <div class="flex-between"><span>รับเงินมา:</span><span>฿${receiptData.tenderAmount.toFixed(2)}</span></div>
      <div class="flex-between font-bold" style="font-size: 11px;"><span>เงินทอน (Change Due):</span><span>฿${receiptData.changeDue.toFixed(2)}</span></div>
    ` : ''}
  </div>

  <div class="border-dashed"></div>

  <div class="text-center" style="font-size: 9.5px; color: #475569; margin-top: 6px;">
    ${receiptData.enableVat ? '<div style="font-weight: bold;">* ราคารวมภาษีมูลค่าเพิ่มแล้ว *</div>' : ''}
    <div style="font-size: 10px; font-weight: 700; color: #1e293b; margin: 3px 0;">${receiptData.receiptFooter}</div>
    ${(receiptData.wifiSsid || receiptData.wifiPassword) ? `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px; border-radius: 6px; margin: 4px 0; font-size: 9px;">
        📶 Wi-Fi: <b>${receiptData.wifiSsid || 'DuckNoodle'}</b> | Pass: <b>${receiptData.wifiPassword || '88888888'}</b>
      </div>
    ` : ''}
    <div style="font-size: 8.5px; color: #94a3b8; margin-top: 4px;">ขอบคุณที่ใช้บริการ โอกาสหน้าเชิญใหม่นะคะ</div>
  </div>
</body>
</html>`);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 200);
}
