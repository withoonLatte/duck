'use client';

import React from 'react';
import { X, QrCode, ExternalLink, Printer } from 'lucide-react';
import Link from 'next/link';
import { TableQRCode } from './qr-code-canvas';

interface QRCodeModalProps {
  table: {
    id: string;
    number: string;
    name: string;
  };
  onClose: () => void;
}

export function QRCodeModal({ table, onClose }: QRCodeModalProps) {
  const qrUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/order?table=${table.number}`
    : `http://localhost:3000/order?table=${table.number}`;

  return (
    <div 
      onClick={onClose}
      className='fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[100] animate-in fade-in duration-200'
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className='bg-white rounded-4xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative'
      >
        {/* Header */}
        <div className='p-4 pt-5 bg-[#0C3B2E] text-white arch-header flex items-center justify-between shadow-sm shrink-0'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-2xl bg-[#84CC16] text-[#072E20] flex items-center justify-center font-black shadow-md shrink-0'>
              <QrCode className='w-5 h-5' />
            </div>
            <div>
              <h3 className='text-base font-black text-white'>QR Code โต๊ะ {table.number}</h3>
              <p className='text-[11px] text-emerald-200/80 font-medium truncate max-w-[180px]'>{table.name}</p>
            </div>
          </div>
          <button 
            type='button'
            onClick={onClose} 
            title='ปิดหน้าต่าง'
            className='w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 cursor-pointer active:scale-95 transition-all'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Dynamic QR Code Canvas */}
        <div className='p-5 sm:p-6 text-center space-y-4'>
          <div className='p-4 bg-gradient-to-b from-emerald-50/50 to-slate-50 rounded-3xl border-2 border-dashed border-emerald-300 max-w-[260px] mx-auto shadow-inner space-y-3'>
            <TableQRCode value={qrUrl} size={190} tableNumber={table.number} showDownload={true} />
            <div>
              <div className='font-black text-slate-900 text-sm'>สแกนเพื่อสั่งอาหาร</div>
              <div className='text-[10px] text-slate-500 font-medium'>โต๊ะ {table.number} ({table.name})</div>
            </div>
          </div>

          <Link
            href='/settings'
            className='inline-flex items-center gap-1.5 text-xs text-[#0C3B2E] font-black hover:underline'
          >
            <span>🖨️ ไปที่หน้าตั้งค่าและพิมพ์ป้ายตั้งโต๊ะทั้งหมด</span>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className='p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2'>
          <button
            type='button'
            onClick={() => window.print()}
            className='flex-1 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer active:scale-95'
          >
            <Printer className='w-3.5 h-3.5 text-[#0C3B2E]' />
            <span>พิมพ์ป้าย</span>
          </button>
          <Link
            href={`/order?table=${table.number}`}
            target='_blank'
            className='flex-1 py-3 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-black rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-transform active:scale-95 text-center'
          >
            <ExternalLink className='w-3.5 h-3.5' />
            <span>ทดสอบสั่ง QR</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
