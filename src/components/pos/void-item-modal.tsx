'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRestaurant, StoreOrderItem } from '@/lib/store/restaurant-store';
import { 
  X, 
  ShieldAlert, 
  Camera, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  PenTool, 
  KeyRound,
  Upload
} from 'lucide-react';

interface VoidItemModalProps {
  tableId: string;
  tableNumber: string;
  item: StoreOrderItem;
  onClose: () => void;
  onSuccess: () => void;
}

const VOID_REASONS = [
  'ลูกค้าเปลี่ยนใจ (ก่อนเข้าครัว)',
  'ครัวทำผิดสูตร / อาหารมีปัญหา',
  'อาหารเสียหาย / หกเลอะ (Waste)',
  'รอนานเกินไป ลูกค้าขอยกเลิก',
  'พนักงานคีย์ผิดโต๊ะ / ซ้ำซ้อน',
];

export function VoidItemModal({ tableId, tableNumber, item, onClose, onSuccess }: VoidItemModalProps) {
  const { voidOrderItemWithEvidence, staffMembers } = useRestaurant();
  
  const [selectedReason, setSelectedReason] = useState(VOID_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [managerPin, setManagerPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signature Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Setup Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Photo Upload / Camera Capture Handler
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Form Submit
  const handleConfirmVoid = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!hasSignature) {
      setErrorMsg('กรุณาเซ็นชื่อกำกับการยกเลิกบนหน้าจอ');
      return;
    }

    if (managerPin.length !== 4) {
      setErrorMsg('กรุณากรอกรหัส PIN ผู้อนุมัติ 4 หลัก');
      return;
    }

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';
    const finalReason = customReason ? `${selectedReason} - ${customReason}` : selectedReason;

    setIsSubmitting(true);
    const result = voidOrderItemWithEvidence(tableId, item.id, {
      reason: finalReason,
      photoUrl: photoUrl || undefined,
      signatureUrl: signatureDataUrl,
      managerName: 'Manager',
      pin: managerPin,
    });

    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(result.error || 'เกิดข้อผิดพลาดในการยกเลิก');
    }
  };

  return (
    <div 
      onClick={onClose}
      className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200'
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className='bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-red-200 space-y-4 max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200'
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-red-100 pb-3'>
          <div className='flex items-center space-x-2 text-red-700 font-bold text-sm sm:text-base'>
            <div className='w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-xs'>
              <ShieldAlert className='w-5 h-5' />
            </div>
            <div>
              <div className='leading-tight'>อนุมัติยกเลิกรายการอาหาร (Void Item)</div>
              <div className='text-[10px] text-slate-500 font-normal'>ระบบป้องกันการทุจริต & บันทึกหลักฐาน</div>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Void Item Summary Card */}
        <div className='bg-red-50/70 border border-red-200 rounded-2xl p-3 flex items-center justify-between text-xs'>
          <div>
            <span className='px-2 py-0.5 rounded-lg bg-red-200/80 text-red-900 font-bold text-[10px] mr-1.5'>
              โต๊ะ {tableNumber}
            </span>
            <span className='font-bold text-slate-900 text-sm'>{item.productName}</span>
            <span className='font-semibold text-slate-600 ml-1'>x{item.quantity}</span>
            {item.modifiers.length > 0 && (
              <div className='text-[10.5px] text-slate-500 mt-0.5'>
                + {item.modifiers.map((m) => m.optionName).join(', ')}
              </div>
            )}
          </div>
          <div className='text-right'>
            <span className='text-[10px] text-slate-500 block'>มูลค่ายกเลิก:</span>
            <span className='font-bold text-red-700 text-sm'>฿{item.lineTotal.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleConfirmVoid} className='space-y-4 text-xs'>
          {/* 1. Reason Selection */}
          <div>
            <label className='block font-bold text-slate-700 mb-1.5'>1. ระบุเหตุผลในการยกเลิก *</label>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-1.5'>
              {VOID_REASONS.map((r) => (
                <button
                  key={r}
                  type='button'
                  onClick={() => setSelectedReason(r)}
                  className={
                    'p-2 rounded-xl text-left text-[11px] font-semibold border transition-all cursor-pointer ' +
                    (selectedReason === r
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200')
                  }
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type='text'
              placeholder='หมายเหตุเพิ่มเติม (ถ้ามี)...'
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className='w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-[#0C3B2E]'
            />
          </div>

          {/* 2. Photo Capture / Upload */}
          <div>
            <label className='block font-bold text-slate-700 mb-1.5 flex items-center justify-between'>
              <span className='flex items-center gap-1.5'>
                <Camera className='w-4 h-4 text-slate-600' />
                <span>2. รูปถ่ายจานอาหาร (ถ้าปรุงเสร็จแล้ว/เสียหาย)</span>
              </span>
              <span className='text-[10px] text-slate-400 font-normal'>* ไม่บังคับ</span>
            </label>

            {photoUrl ? (
              <div className='relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-32 flex items-center justify-center'>
                <img src={photoUrl} alt='Void Food Evidence' className='w-full h-full object-cover' />
                <button
                  type='button'
                  onClick={() => setPhotoUrl(null)}
                  className='absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-xl text-xs flex items-center gap-1 backdrop-blur-md cursor-pointer'
                >
                  <Trash2 className='w-3.5 h-3.5' />
                  <span>ถ่ายใหม่</span>
                </button>
              </div>
            ) : (
              <label className='flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-red-400 hover:bg-red-50/40 rounded-2xl p-4 cursor-pointer transition-colors'>
                <Camera className='w-6 h-6 text-slate-400 mb-1' />
                <span className='font-bold text-slate-700 text-xs'>แตะเพื่อเปิดกล้องถ่ายรูป หรือเลือกรูปภาพ</span>
                <span className='text-[10px] text-slate-400 mt-0.5'>ถ่ายรูปจานอาหารเพื่อเป็นหลักฐานในระบบ Audit</span>
                <input
                  type='file'
                  accept='image/*'
                  capture='environment'
                  onChange={handlePhotoCapture}
                  className='hidden'
                />
              </label>
            )}
          </div>

          {/* 3. Digital Signature Pad */}
          <div>
            <div className='flex items-center justify-between mb-1.5'>
              <label className='font-bold text-slate-700 flex items-center gap-1.5'>
                <PenTool className='w-4 h-4 text-[#0C3B2E]' />
                <span>3. แคชเชียร์ / ผู้จัดการ เซ็นชื่อกำกับ *</span>
              </label>
              {hasSignature && (
                <button
                  type='button'
                  onClick={handleClearSignature}
                  className='text-[10.5px] text-slate-500 hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer'
                >
                  <RotateCcw className='w-3 h-3' />
                  <span>ล้างลายเซ็น</span>
                </button>
              )}
            </div>

            <div className='relative bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden touch-none'>
              <canvas
                ref={canvasRef}
                width={440}
                height={110}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className='w-full h-[110px] cursor-crosshair block'
              />
              {!hasSignature && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium'>
                  ✍️ ใช้นิ้วหรือปากกาเซ็นชื่อในกรอบนี้
                </div>
              )}
            </div>
          </div>

          {/* 4. Manager PIN Code */}
          <div>
            <label className='block font-bold text-slate-700 mb-1 flex items-center gap-1.5'>
              <KeyRound className='w-4 h-4 text-[#0C3B2E]' />
              <span>4. ใส่รหัส PIN ผู้จัดการ 4 หลัก เพื่ออนุมัติ *</span>
            </label>
            <input
              type='password'
              required
              maxLength={4}
              pattern='[0-9]{4}'
              placeholder='••••'
              value={managerPin}
              onChange={(e) => setManagerPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-center tracking-widest text-base focus:outline-[#0C3B2E]'
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className='bg-red-50 text-red-700 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-shake'>
              <AlertTriangle className='w-4 h-4 shrink-0' />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className='pt-2 flex items-center justify-end gap-2 border-t border-slate-100'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer'
            >
              ยกเลิก
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95'
            >
              <CheckCircle2 className='w-4 h-4' />
              <span>ยืนยันอนุมัติยกเลิกจานนี้</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
