'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useRestaurant, StaffMember, checkRoleRoutePermission } from '@/lib/store/restaurant-store';
import { 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Delete, 
  Utensils, 
  ShieldCheck, 
  ChefHat, 
  Store, 
  Smartphone, 
  Settings 
} from 'lucide-react';

export function PinLockScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { switchStaffByPin, staffMembers, restaurantSettings } = useRestaurant();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successStaff, setSuccessStaff] = useState<StaffMember | null>(null);

  // If on customer QR ordering page, do not lock with staff PIN
  if (pathname.startsWith('/order')) {
    return null;
  }

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMsg('');

    // Check automatically on 4th digit
    if (newPin.length === 4) {
      setTimeout(() => {
        const res = switchStaffByPin(newPin);
        if (res.success && res.staff) {
          setSuccessStaff(res.staff);
          setTimeout(() => {
            // Auto redirect based on staff role permission
            if (res.staff!.role === 'KITCHEN') {
              router.replace('/kds');
            } else if (res.staff!.role === 'WAITER') {
              router.replace('/pos');
            } else if (!checkRoleRoutePermission(res.staff!.role, pathname)) {
              router.replace('/pos');
            }
          }, 500);
        } else {
          setErrorMsg(res.error || 'รหัส PIN 4 หลักไม่ถูกต้อง');
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

  const handleQuickDemoFill = (demoPin: string) => {
    setPin(demoPin);
    const res = switchStaffByPin(demoPin);
    if (res.success && res.staff) {
      setSuccessStaff(res.staff);
      setTimeout(() => {
        if (res.staff!.role === 'KITCHEN') {
          router.replace('/kds');
        } else if (res.staff!.role === 'WAITER') {
          router.replace('/pos');
        } else if (!checkRoleRoutePermission(res.staff!.role, pathname)) {
          router.replace('/pos');
        }
      }, 500);
    }
  };

  return (
    <div 
      className='fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 overflow-y-auto'
      style={{
        background: 'linear-gradient(135deg, #191654 0%, #1a3f4e 50%, #0C3B2E 100%)',
      }}
    >
      <div className='w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-4xl p-6 sm:p-7 shadow-2xl border border-white/30 text-center space-y-4 my-auto animate-in zoom-in-95 duration-300'>
        {/* Brand Header */}
        <div className='flex flex-col items-center space-y-2'>
          <div className='w-14 h-14 rounded-3xl bg-[#D9531E] flex items-center justify-center text-white shadow-lg overflow-hidden ring-4 ring-white/20'>
            {restaurantSettings.logoUrl ? (
              <img src={restaurantSettings.logoUrl} alt='Logo' className='w-full h-full object-cover' />
            ) : (
              <Utensils className='w-7 h-7' />
            )}
          </div>
          <div>
            <h2 className='font-black text-slate-900 text-base sm:text-lg leading-tight'>{restaurantSettings.name}</h2>
            <p className='text-xs text-slate-500 font-medium'>{restaurantSettings.branchName}</p>
          </div>
        </div>

        {/* Success View or Keypad */}
        {successStaff ? (
          <div className='py-8 space-y-3 animate-in zoom-in-95'>
            <div className='w-16 h-16 rounded-full bg-[#84CC16] text-[#072E20] flex items-center justify-center mx-auto shadow-lg animate-bounce'>
              <CheckCircle2 className='w-9 h-9' />
            </div>
            <div className='space-y-1'>
              <h3 className='font-black text-lg text-slate-900'>{successStaff.name}</h3>
              <div className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs'>
                <ShieldCheck className='w-3.5 h-3.5' />
                <span>ตำแหน่ง: {successStaff.role}</span>
              </div>
            </div>
            <p className='text-xs text-slate-500 font-medium'>กำลังนำคุณเข้าสู่ระบบปฏิบัติการร้าน...</p>
          </div>
        ) : (
          <>
            <div className='space-y-1 pt-1'>
              <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0C3B2E] font-bold text-xs border border-emerald-200'>
                <Lock className='w-3.5 h-3.5 text-[#0C3B2E]' />
                <span>กรุณาใส่รหัส PIN 4 หลักเพื่อเข้าใช้งาน</span>
              </div>
            </div>

            {/* 4-Digit Dots Indicator */}
            <div className='flex items-center justify-center space-x-4 py-2'>
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={
                      'w-4 h-4 rounded-full transition-all duration-150 ' +
                      (filled
                        ? 'bg-[#0C3B2E] scale-125 shadow-sm'
                        : 'bg-slate-200 border-2 border-slate-300')
                    }
                  />
                );
              })}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className='bg-red-50 text-red-700 text-xs font-bold p-2 rounded-2xl flex items-center justify-center gap-1.5 animate-shake'>
                <AlertCircle className='w-4 h-4 shrink-0' />
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
                  className='h-12 sm:h-13 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200/90 rounded-2xl font-bold text-lg text-slate-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer'
                >
                  {digit}
                </button>
              ))}

              <button
                type='button'
                onClick={handleClear}
                className='h-12 sm:h-13 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-2xl font-bold text-xs text-slate-600 flex items-center justify-center transition-all cursor-pointer'
              >
                ล้าง (C)
              </button>

              <button
                type='button'
                onClick={() => handleDigit('0')}
                className='h-12 sm:h-13 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200/90 rounded-2xl font-bold text-lg text-slate-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer'
              >
                0
              </button>

              <button
                type='button'
                onClick={handleDelete}
                className='h-12 sm:h-13 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-2xl text-slate-700 flex items-center justify-center transition-all cursor-pointer'
                title='ลบตัวเลข'
              >
                <Delete className='w-5 h-5' />
              </button>
            </div>

            {/* Quick Staff Selection Chips (Touch to Test/Login) */}
            <div className='pt-2 border-t border-slate-100 text-left space-y-1.5'>
              <div className='text-[10.5px] font-bold text-slate-500 flex items-center justify-between'>
                <span>🔑 แตะชื่อเพื่อใส่ PIN ด่วน:</span>
              </div>
              <div className='grid grid-cols-2 gap-1 text-[11px]'>
                {staffMembers.map((s) => (
                  <button
                    key={s.id}
                    type='button'
                    onClick={() => handleQuickDemoFill(s.pin)}
                    className='p-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left flex items-center justify-between cursor-pointer transition-colors'
                  >
                    <span className='font-bold text-slate-800 truncate'>{s.name.split(' ')[0]}</span>
                    <span className='font-mono font-bold text-emerald-800 text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded'>
                      {s.pin}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
