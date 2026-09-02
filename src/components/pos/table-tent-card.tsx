'use client';

import React from 'react';
import { TableQRCode } from './qr-code-canvas';
import { Utensils, Wifi, Smartphone, Sparkles, QrCode } from 'lucide-react';

interface TableTentCardProps {
  table: {
    id: string;
    number: string;
    name: string;
    capacity: number;
    floor: string;
  };
  baseUrl: string;
  styleMode?: 'ACRYLIC' | 'WOOD' | 'STICKER';
}

export function TableTentCard({ table, baseUrl, styleMode = 'ACRYLIC' }: TableTentCardProps) {
  const qrUrl = `${baseUrl}/order?table=${table.number}`;

  if (styleMode === 'STICKER') {
    return (
      <div className='w-72 bg-white rounded-3xl p-5 border-2 border-dashed border-emerald-400 shadow-md flex flex-col items-center text-center space-y-3 print:border-solid print:shadow-none'>
        <div className='flex items-center space-x-2 text-[#0C3B2E]'>
          <div className='w-7 h-7 rounded-xl bg-[#D9531E] text-white flex items-center justify-center font-black text-xs'>
            <Utensils className='w-4 h-4' />
          </div>
          <span className='font-black text-xs'>ก๋วยเตี๋ยวเป็ดนายเอก</span>
        </div>

        <div className='px-4 py-1 rounded-full bg-[#0C3B2E] text-[#84CC16] font-black text-sm'>
          โต๊ะ {table.number}
        </div>

        <TableQRCode value={qrUrl} size={150} tableNumber={table.number} showDownload={false} />

        <div className='text-[11px] font-black text-slate-800 leading-tight'>
          สแกนสั่งอาหาร • Scan to Order
        </div>
      </div>
    );
  }

  return (
    <div className='w-80 bg-white rounded-4xl border-2 border-slate-300 shadow-xl overflow-hidden flex flex-col text-center print:border-2 print:border-slate-800 print:shadow-none break-inside-avoid'>
      {/* Top Brand Header */}
      <div className='bg-[#0C3B2E] text-white p-4 pt-5 arch-header flex flex-col items-center space-y-1'>
        <div className='w-10 h-10 rounded-2xl bg-[#D9531E] flex items-center justify-center text-white shadow-md mb-1'>
          <Utensils className='w-5 h-5' />
        </div>
        <h3 className='font-black text-sm tracking-tight text-white'>ร้านก๋วยเตี๋ยวเป็ดนายเอก</h3>
        <span className='text-[10px] text-emerald-200/90 font-medium'>สาขา 1 บรรทัดทอง • Main Branch</span>
      </div>

      {/* Table Badge */}
      <div className='p-5 flex flex-col items-center space-y-3.5'>
        <div className='inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-[#0C3B2E]'>
          <span className='font-black text-base tracking-tight'>{table.name}</span>
          <span className='w-1.5 h-1.5 rounded-full bg-[#D9531E]' />
          <span className='text-xs font-bold text-slate-600'>{table.capacity} ที่นั่ง</span>
        </div>

        {/* Dynamic Scan-ready QR Code */}
        <div className='p-3 bg-gradient-to-b from-slate-50 to-emerald-50/40 rounded-3xl border border-slate-200'>
          <TableQRCode value={qrUrl} size={170} tableNumber={table.number} showDownload={false} />
        </div>

        {/* Instruction */}
        <div className='space-y-0.5'>
          <div className='font-black text-slate-900 text-sm flex items-center justify-center gap-1.5'>
            <Smartphone className='w-4 h-4 text-[#D9531E]' />
            <span>สแกน QR Code เพื่อสั่งอาหาร</span>
          </div>
          <p className='text-[10px] text-slate-500 font-medium'>
            Scan to browse menu & submit your order directly
          </p>
        </div>

        {/* Wi-Fi & Quick Info Box */}
        <div className='w-full bg-slate-50 rounded-2xl p-2.5 border border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-medium'>
          <div className='flex items-center space-x-1.5 text-slate-800 font-bold'>
            <Wifi className='w-3.5 h-3.5 text-[#0C3B2E]' />
            <span>Wi-Fi: DuckNoodle_5G</span>
          </div>
          <span className='font-mono font-bold text-slate-900'>Pass: 88888888</span>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className='p-2.5 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1'>
        <Sparkles className='w-3 h-3 text-amber-600' />
        <span>สั่งง่าย ไม่ต้องรอเรียกพนักงาน • เสิร์ฟเร็ว</span>
      </div>
    </div>
  );
}
