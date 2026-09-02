'use client';

import React, { useState } from 'react';
import { useRestaurant, StaffMember } from '@/lib/store/restaurant-store';
import { X, Lock, CheckCircle2, AlertCircle, Delete, UserCheck } from 'lucide-react';

interface PinPadModalProps {
  onClose: () => void;
  onSuccess?: (staff: StaffMember) => void;
  title?: string;
  description?: string;
}

export function PinPadModal({ 
  onClose, 
  onSuccess, 
  title = 'ใส่รหัส PIN 4 หลัก', 
  description = 'กรุณากดรหัส PIN ประจำตัวพนักงานเพื่อสลับบทบาท' 
}: PinPadModalProps) {
  const { switchStaffByPin, staffMembers } = useRestaurant();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successStaff, setSuccessStaff] = useState<StaffMember | null>(null);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMsg('');

    // Auto submit on 4th digit
    if (newPin.length === 4) {
      setTimeout(() => {
        const res = switchStaffByPin(newPin);
        if (res.success && res.staff) {
          setSuccessStaff(res.staff);
          setTimeout(() => {
            if (onSuccess) onSuccess(res.staff!);
            onClose();
          }, 600);
        } else {
          setErrorMsg(res.error || 'รหัส PIN ไม่ถูกต้อง');
          setPin('');
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  return (
    <div 
      onClick={onClose}
      className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200'
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className='bg-white rounded-3xl max-w-xs w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95 duration-200'
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
          <div className='flex items-center space-x-2 text-slate-900 font-bold text-sm'>
            <Lock className='w-4 h-4 text-[#0C3B2E]' />
            <span>{title}</span>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Success or Normal View */}
        {successStaff ? (
          <div className='py-6 space-y-2 animate-in zoom-in-95'>
            <div className='w-14 h-14 rounded-full bg-[#84CC16] text-[#072E20] flex items-center justify-center mx-auto shadow-md'>
              <CheckCircle2 className='w-8 h-8' />
            </div>
            <h4 className='font-bold text-base text-slate-900'>{successStaff.name}</h4>
            <span className='px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs'>
              เข้าสู่ระบบสำเร็จ
            </span>
          </div>
        ) : (
          <>
            <p className='text-xs text-slate-500 font-normal'>{description}</p>

            {/* 4-Digit Dots Indicator */}
            <div className='flex items-center justify-center space-x-3.5 py-2'>
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={
                      'w-4 h-4 rounded-full transition-all ' +
                      (filled
                        ? 'bg-[#0C3B2E] scale-110 shadow-xs'
                        : 'bg-slate-200 border-2 border-slate-300')
                    }
                  />
                );
              })}
            </div>

            {/* Error Callout */}
            {errorMsg && (
              <div className='bg-red-50 text-red-700 text-xs font-semibold p-2 rounded-xl flex items-center justify-center gap-1 animate-shake'>
                <AlertCircle className='w-3.5 h-3.5 shrink-0' />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 0-9 Numeric Keypad */}
            <div className='grid grid-cols-3 gap-2 pt-1'>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type='button'
                  onClick={() => handleDigit(digit)}
                  className='h-12 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-2xl font-bold text-lg text-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer'
                >
                  {digit}
                </button>
              ))}

              <button
                type='button'
                onClick={handleClear}
                className='h-12 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-xs text-slate-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer'
              >
                ล้าง (C)
              </button>

              <button
                type='button'
                onClick={() => handleDigit('0')}
                className='h-12 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-2xl font-bold text-lg text-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer'
              >
                0
              </button>

              <button
                type='button'
                onClick={handleDelete}
                className='h-12 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer'
                title='ลบตัวเลขล่าสุด'
              >
                <Delete className='w-5 h-5' />
              </button>
            </div>

            {/* Quick Demo Staff Hints */}
            <div className='pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5 text-left bg-slate-50/70 p-2 rounded-xl'>
              <div className='font-bold text-slate-600'>💡 ตัวอย่างรหัส PIN เริ่มต้น:</div>
              <div className='flex flex-wrap gap-x-2 gap-y-0.5'>
                {staffMembers.slice(0, 4).map((s) => (
                  <span key={s.id} className='text-slate-500'>
                    {s.name.split(' ')[0]}: <b className='text-slate-700 font-mono'>{s.pin}</b>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
