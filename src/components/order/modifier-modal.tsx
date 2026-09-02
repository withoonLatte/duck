'use client';

import React, { useState } from 'react';
import { FIXTURE_MODIFIERS, FixtureProduct } from '@/lib/store/fixtures';
import { OrderItemModifierOption } from '@/lib/store/restaurant-store';
import { X, Plus, Minus, Star, Zap, ShoppingBag, ArrowLeft } from 'lucide-react';
import { VoiceInputField } from './voice-input-field';

interface ModifierModalProps {
  product: FixtureProduct;
  onClose: () => void;
  onAddToCart: (quantity: number, modifiers: OrderItemModifierOption[], notes: string) => void;
}

export function ModifierModal({ product, onClose, onAddToCart }: ModifierModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedNoodle, setSelectedNoodle] = useState('เส้นเล็ก');
  const [selectedSize, setSelectedSize] = useState('ธรรมดา');
  const [selectedSpicy, setSelectedSpicy] = useState('เผ็ดปกติ');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Calculate modifier price delta
  const noodleGroup = FIXTURE_MODIFIERS.find((g) => g.name === 'เลือกชนิดเส้น');
  const sizeGroup = FIXTURE_MODIFIERS.find((g) => g.name === 'ระดับความพิเศษ');
  const toppingGroup = FIXTURE_MODIFIERS.find((g) => g.name === 'เพิ่มเครื่อง / ท็อปปิ้ง');

  const noodlePrice = noodleGroup?.options.find((o) => o.name === selectedNoodle)?.price || 0;
  const sizePrice = sizeGroup?.options.find((o) => o.name === selectedSize)?.price || 0;
  const toppingsPrice = selectedToppings.reduce((sum, name) => {
    const opt = toppingGroup?.options.find((o) => o.name === name);
    return sum + (opt?.price || 0);
  }, 0);

  const modifierTotal = noodlePrice + sizePrice + toppingsPrice;
  const unitTotal = product.price + modifierTotal;
  const grandTotal = unitTotal * quantity;

  const toggleTopping = (name: string) => {
    setSelectedToppings((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const handleConfirm = () => {
    const modifiersList: OrderItemModifierOption[] = [];

    if (product.category.includes('ก๋วยเตี๋ยว')) {
      modifiersList.push({ groupName: 'เลือกเส้น', optionName: selectedNoodle, price: noodlePrice });
      modifiersList.push({ groupName: 'ความพิเศษ', optionName: selectedSize, price: sizePrice });
      modifiersList.push({ groupName: 'ความเผ็ด', optionName: selectedSpicy, price: 0 });
    }

    selectedToppings.forEach((t) => {
      const opt = toppingGroup?.options.find((o) => o.name === t);
      modifiersList.push({ groupName: 'เพิ่มท็อปปิ้ง', optionName: t, price: opt?.price || 0 });
    });

    onAddToCart(quantity, modifiersList, notes);
  };

  return (
    <div className='fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100] animate-in fade-in duration-200'>
      <div className='bg-white rounded-t-4xl sm:rounded-4xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200'>
        {/* Curved Header */}
        <div className='bg-[#0C3B2E] text-white p-3.5 sm:p-4 arch-header flex items-center justify-between relative shadow-sm shrink-0 z-10'>
          <button
            onClick={onClose}
            className='w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#0C3B2E] flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer'
          >
            <ArrowLeft className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>

          <h3 className='text-sm sm:text-base font-black text-white tracking-tight'>รายละเอียดเมนูอาหาร</h3>

          <button
            onClick={onClose}
            className='w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors cursor-pointer'
          >
            <X className='w-4 h-4 sm:w-5 sm:h-5' />
          </button>
        </div>

        {/* Modal Body */}
        <div className='p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs flex-1 overscroll-contain'>
          {/* Hero Food Photo */}
          <div className='w-full h-40 sm:h-48 rounded-3xl overflow-hidden bg-slate-100 relative shadow-md'>
            <img
              src={product.imageUrl}
              alt={product.name}
              className='w-full h-full object-cover'
            />
            <div className='absolute bottom-3 left-3 bg-[#0C3B2E]/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] sm:text-xs font-black text-white'>
              {product.category}
            </div>
            <div className='absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs sm:text-sm font-black text-[#D9531E] shadow-sm'>
              ฿{product.price.toFixed(2)}
            </div>
          </div>

          {/* Dish Title & Description */}
          <div>
            <h2 className='text-lg sm:text-2xl font-black text-slate-900 leading-snug'>{product.name}</h2>
            <p className='text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed'>{product.description}</p>
          </div>

          {/* Quick Badges */}
          <div className='flex items-center gap-3 py-2 border-y border-slate-100 text-[10px] sm:text-[11px] text-slate-600'>
            <span className='flex items-center gap-1 font-bold text-amber-600'>
              <Star className='w-3.5 h-3.5 fill-amber-500 text-amber-500' />
              <span>4.9 Rating (สูตรเด็ดนายเอก)</span>
            </span>
            <span>•</span>
            <span className='flex items-center gap-1 font-semibold text-emerald-700'>
              <Zap className='w-3.5 h-3.5' />
              <span>ปรุงสดใหม่จานต่อจาน</span>
            </span>
          </div>

          {/* Modifiers: Choice of Noodles */}
          {product.category.includes('ก๋วยเตี๋ยว') && (
            <div className='space-y-2'>
              <label className='font-black text-slate-900 text-xs flex items-center justify-between'>
                <span>1. เลือกชนิดเส้น (จำเป็น)</span>
                <span className='text-[10px] font-extrabold text-[#0C3B2E] bg-emerald-50 px-2 py-0.5 rounded-full'>
                  เลือก 1 อย่าง
                </span>
              </label>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                {noodleGroup?.options.map((opt) => (
                  <button
                    key={opt.id}
                    type='button'
                    onClick={() => setSelectedNoodle(opt.name)}
                    className={
                      'p-2.5 sm:p-3 rounded-2xl border text-left font-black transition-all flex items-center justify-between cursor-pointer ' +
                      (selectedNoodle === opt.name
                        ? 'border-[#0C3B2E] bg-[#0C3B2E] text-white shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50')
                    }
                  >
                    <span className='text-xs'>{opt.name}</span>
                    {opt.price > 0 && (
                      <span
                        className={
                          'text-[10px] ' +
                          (selectedNoodle === opt.name ? 'text-[#84CC16]' : 'text-[#D9531E]')
                        }
                      >
                        +{opt.price}฿
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modifiers: Size */}
          {product.category.includes('ก๋วยเตี๋ยว') && (
            <div className='space-y-2'>
              <label className='font-black text-slate-900 text-xs flex items-center justify-between'>
                <span>2. ระดับความพิเศษ</span>
                <span className='text-[10px] font-extrabold text-[#0C3B2E] bg-emerald-50 px-2 py-0.5 rounded-full'>
                  เลือก 1 อย่าง
                </span>
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {sizeGroup?.options.map((opt) => (
                  <button
                    key={opt.id}
                    type='button'
                    onClick={() => setSelectedSize(opt.name)}
                    className={
                      'p-2.5 sm:p-3 rounded-2xl border text-center font-black transition-all cursor-pointer ' +
                      (selectedSize === opt.name
                        ? 'border-[#D9531E] bg-[#D9531E] text-white shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50')
                    }
                  >
                    <div className='text-xs'>{opt.name}</div>
                    {opt.price > 0 && (
                      <div
                        className={
                          'text-[10px] mt-0.5 ' +
                          (selectedSize === opt.name ? 'text-amber-200' : 'text-[#D9531E]')
                        }
                      >
                        +{opt.price}฿
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modifiers: Spicy Level */}
          {product.category.includes('ก๋วยเตี๋ยว') && (
            <div className='space-y-2'>
              <label className='font-black text-slate-900 text-xs flex items-center justify-between'>
                <span>3. ระดับความเผ็ด</span>
                <span className='text-[10px] font-semibold text-slate-400'>พริกคั่วโบราณ</span>
              </label>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                {['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดปกติ', 'เผ็ดมาก'].map((spicy) => (
                  <button
                    key={spicy}
                    type='button'
                    onClick={() => setSelectedSpicy(spicy)}
                    className={
                      'p-2 sm:p-2.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ' +
                      (selectedSpicy === spicy
                        ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-300 font-black'
                        : 'border-slate-200 text-slate-600 bg-slate-50/50')
                    }
                  >
                    {spicy}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modifiers: Extra Toppings */}
          <div className='space-y-2'>
            <label className='font-black text-slate-900 text-xs flex items-center justify-between'>
              <span>4. เพิ่มเครื่องพิเศษ (เลือกได้หลายอย่าง)</span>
              <span className='text-[10px] font-semibold text-slate-400'>ท็อปปิ้ง</span>
            </label>
            <div className='space-y-1.5'>
              {toppingGroup?.options.map((opt) => {
                const isChecked = selectedToppings.includes(opt.name);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleTopping(opt.name)}
                    className={
                      'p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ' +
                      (isChecked
                        ? 'border-[#0C3B2E] bg-emerald-50/70 text-[#0C3B2E] font-black'
                        : 'border-slate-200 text-slate-700 bg-slate-50/40 hover:bg-slate-50')
                    }
                  >
                    <div className='flex items-center space-x-2.5'>
                      <div
                        className={
                          'w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ' +
                          (isChecked
                            ? 'bg-[#0C3B2E] border-[#0C3B2E] text-white'
                            : 'border-slate-300 bg-white')
                        }
                      >
                        {isChecked && <span className='text-xs leading-none'>✓</span>}
                      </div>
                      <span className='text-xs font-bold'>{opt.name}</span>
                    </div>
                    <span className='font-black text-xs text-[#D9531E]'>+{opt.price}฿</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voice-Enabled Kitchen Note */}
          <VoiceInputField
            value={notes}
            onChange={setNotes}
            label='หมายเหตุเพิ่มเติมถึงพ่อครัว (พิมพ์หรือกดไมค์พูด)'
            placeholder='เช่น ไม่ใส่กระเทียมเจียว, แยกน้ำซุป, ไม่ใส่ถั่วงอก...'
            quickPresets={[
              'ไม่ใส่ถั่วงอก',
              'ไม่ใส่กระเทียมเจียว',
              'แยกน้ำซุป',
              'ผักชีเยอะๆ',
              'น้ำซุปร้อนๆ',
              'ขอน้ำจิ้มเพิ่ม',
            ]}
          />
        </div>

        {/* Sticky Modal Action Footer */}
        <div className='p-3.5 sm:p-4 border-t border-slate-200 bg-white shadow-2xl flex items-center justify-between gap-3 shrink-0 z-20'>
          {/* Stepper */}
          <div className='flex items-center space-x-2 bg-slate-100 rounded-2xl px-2.5 py-1.5 border border-slate-200'>
            <button
              type='button'
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className='w-8 h-8 flex items-center justify-center rounded-xl bg-white text-slate-700 hover:bg-slate-200 font-black shadow-xs cursor-pointer active:scale-95'
            >
              <Minus className='w-4 h-4' />
            </button>
            <span className='w-6 text-center font-black text-slate-900 text-sm'>{quantity}</span>
            <button
              type='button'
              onClick={() => setQuantity((q) => q + 1)}
              className='w-8 h-8 flex items-center justify-center rounded-xl bg-white text-slate-700 hover:bg-slate-200 font-black shadow-xs cursor-pointer active:scale-95'
            >
              <Plus className='w-4 h-4' />
            </button>
          </div>

          {/* Confirm Add To Cart Button */}
          <button
            type='button'
            onClick={handleConfirm}
            className='flex-1 py-3.5 sm:py-4 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xl transition-transform active:scale-95 cursor-pointer'
          >
            <ShoppingBag className='w-4 h-4' />
            <span>ใส่ตะกร้า • ฿{grandTotal.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
