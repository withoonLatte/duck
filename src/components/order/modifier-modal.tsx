'use client';

import React, { useState, useMemo } from 'react';
import { FIXTURE_MODIFIERS, FixtureProduct, FixtureModifierGroup } from '@/lib/store/fixtures';
import { OrderItemModifierOption } from '@/lib/store/restaurant-store';
import { X, Plus, Minus, Star, Zap, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { VoiceInputField } from './voice-input-field';

interface ModifierModalProps {
  product: FixtureProduct;
  onClose: () => void;
  onAddToCart: (quantity: number, modifiers: OrderItemModifierOption[], notes: string) => void;
}

export function ModifierModal({ product, onClose, onAddToCart }: ModifierModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // 1. Gather all active modifier groups for this product
  const activeGroups = useMemo<FixtureModifierGroup[]>(() => {
    const defaultIds = product.category.includes('ก๋วยเตี๋ยว') || product.category.includes('บะหมี่')
      ? ['mod-01', 'mod-02', 'mod-03', 'mod-04']
      : product.category.includes('เครื่องดื่ม')
      ? ['mod-05']
      : ['mod-02', 'mod-04'];

    const targetIds = product.modifierGroupIds || defaultIds;
    const standardGroups = FIXTURE_MODIFIERS.filter((g) => targetIds.includes(g.id));
    const customGroups = product.customModifiers || [];
    return [...standardGroups, ...customGroups];
  }, [product]);

  // 2. State for single-select groups and multi-select groups
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    activeGroups.forEach((g) => {
      if (g.max === 1 || g.required) {
        const defaultOpt = g.options.find((o) => o.isDefault) || g.options[0];
        if (defaultOpt) initial[g.id] = defaultOpt.name;
      }
    });
    return initial;
  });

  const [multiSelectOptions, setMultiSelectOptions] = useState<Record<string, string[]>>({});

  // 3. Calculate total price delta
  const modifierTotal = useMemo(() => {
    let sum = 0;
    activeGroups.forEach((g) => {
      if (g.max === 1 || g.required) {
        const selName = selectedOptions[g.id];
        const opt = g.options.find((o) => o.name === selName);
        if (opt) sum += opt.price;
      } else {
        const selList = multiSelectOptions[g.id] || [];
        selList.forEach((optName) => {
          const opt = g.options.find((o) => o.name === optName);
          if (opt) sum += opt.price;
        });
      }
    });
    return sum;
  }, [activeGroups, selectedOptions, multiSelectOptions]);

  const unitTotal = product.price + modifierTotal;
  const grandTotal = unitTotal * quantity;

  // Handlers
  const handleSingleSelect = (groupId: string, optionName: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: optionName }));
  };

  const handleToggleMultiSelect = (groupId: string, optionName: string) => {
    setMultiSelectOptions((prev) => {
      const current = prev[groupId] || [];
      const updated = current.includes(optionName)
        ? current.filter((item) => item !== optionName)
        : [...current, optionName];
      return { ...prev, [groupId]: updated };
    });
  };

  const handleConfirm = () => {
    const modifiersList: OrderItemModifierOption[] = [];

    activeGroups.forEach((g) => {
      if (g.max === 1 || g.required) {
        const selName = selectedOptions[g.id];
        if (selName) {
          const opt = g.options.find((o) => o.name === selName);
          modifiersList.push({
            groupName: g.name,
            optionName: selName,
            price: opt ? opt.price : 0,
          });
        }
      } else {
        const selList = multiSelectOptions[g.id] || [];
        selList.forEach((optName) => {
          const opt = g.options.find((o) => o.name === optName);
          modifiersList.push({
            groupName: g.name,
            optionName: optName,
            price: opt ? opt.price : 0,
          });
        });
      }
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

          <h3 className='text-sm sm:text-base font-black text-white tracking-tight'>รายละเอียด & ตัวเลือกเมนู</h3>

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
            <h2 className='text-lg sm:text-2xl font-black text-slate-900 leading-snug flex items-center gap-2 flex-wrap'>
              {product.menuCode && (
                <span className='px-2.5 py-1 rounded-xl bg-[#0C3B2E] text-[#84CC16] font-mono font-black text-sm sm:text-base shrink-0 shadow-xs'>
                  {product.menuCode}
                </span>
              )}
              <span>{product.name}</span>
              {product.nickname && (
                <span className='px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs'>
                  ชื่อเล่น: {product.nickname}
                </span>
              )}
            </h2>
            {product.description && (
              <p className='text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed'>{product.description}</p>
            )}
          </div>

          {/* Dynamic Modifier Groups List */}
          {activeGroups.map((group) => {
            const isSingle = group.max === 1 || group.required;
            return (
              <div key={group.id} className='space-y-2 pt-2 border-t border-slate-100'>
                <div className='flex items-center justify-between'>
                  <label className='font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5'>
                    <span>{group.name}</span>
                    {group.required && (
                      <span className='text-[9.5px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold border border-red-200'>
                        * จำเป็น
                      </span>
                    )}
                  </label>
                  <span className='text-[10.5px] text-slate-400 font-medium'>
                    {isSingle ? 'เลือกได้ 1 อย่าง' : 'เลือกได้หลายอย่าง'}
                  </span>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                  {group.options.map((opt) => {
                    const isSelected = isSingle
                      ? selectedOptions[group.id] === opt.name
                      : (multiSelectOptions[group.id] || []).includes(opt.name);

                    return (
                      <button
                        key={opt.id}
                        type='button'
                        onClick={() => {
                          if (isSingle) handleSingleSelect(group.id, opt.name);
                          else handleToggleMultiSelect(group.id, opt.name);
                        }}
                        className={
                          'p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-1 ' +
                          (isSelected
                            ? 'bg-[#0C3B2E] text-white border-[#0C3B2E] shadow-md ring-2 ring-[#84CC16]'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200')
                        }
                      >
                        <div className='truncate'>
                          <span className='font-bold block truncate'>{opt.name}</span>
                          {opt.price > 0 && (
                            <span className={'text-[10px] font-semibold ' + (isSelected ? 'text-[#84CC16]' : 'text-[#D9531E]')}>
                              +฿{opt.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className='w-3.5 h-3.5 shrink-0 text-[#84CC16]' />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Notes Input Field with Voice Mic */}
          <div className='space-y-1.5 pt-2 border-t border-slate-100'>
            <label className='font-bold text-slate-800 text-xs flex items-center justify-between'>
              <span>หมายเหตุเพิ่มเติม (เช่น ไม่ใส่ผัก, ขอน้ำซุปเพิ่ม)</span>
              <span className='text-[10px] text-slate-400 font-normal'>กดปุ่มไมค์เพื่อพูดได้</span>
            </label>
            <VoiceInputField
              placeholder='พิมพ์ข้อความ หรือกดปุ่มไมค์เพื่อพูด...'
              value={notes}
              onChange={setNotes}
            />
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className='p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0'>
          {/* Quantity Counter */}
          <div className='flex items-center space-x-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs'>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className='w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 cursor-pointer active:scale-95'
            >
              <Minus className='w-3.5 h-3.5' />
            </button>
            <span className='font-black text-sm w-5 text-center text-slate-900'>{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className='w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 cursor-pointer active:scale-95'
            >
              <Plus className='w-3.5 h-3.5' />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleConfirm}
            className='flex-1 py-3 bg-[#D9531E] hover:bg-[#B45309] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer'
          >
            <ShoppingBag className='w-4 h-4' />
            <span>เพิ่มลงในบิล (฿{grandTotal.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
