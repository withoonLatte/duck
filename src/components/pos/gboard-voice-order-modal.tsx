'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRestaurant, StoreOrder, OrderItemModifierOption } from '@/lib/store/restaurant-store';
import { FixtureProduct } from '@/lib/store/fixtures';
import { parseGboardVoiceOrder, ParsedVoiceItem } from '@/lib/utils/voice-parser';
import {
  Mic,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RotateCcw,
  ShoppingBag,
  Send,
  AlertCircle,
  HelpCircle,
  Keyboard,
  Check
} from 'lucide-react';

interface GboardVoiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTable?: {
    id: string;
    number: string;
    name: string;
  };
  onOrderSubmitted?: (orderId: string) => void;
}

export function GboardVoiceOrderModal({
  isOpen,
  onClose,
  targetTable,
  onOrderSubmitted,
}: GboardVoiceOrderModalProps) {
  const { products, tables, addOrderItem, openTable, sendOrderToKitchen, submitQROrder } = useRestaurant();

  const [spokenText, setSpokenText] = useState('');
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>(
    targetTable?.number || (tables.length > 0 ? tables[0].number : 'T01')
  );
  const [isSentToKitchenDirectly, setIsSentToKitchenDirectly] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync targetTable when opened
  useEffect(() => {
    if (targetTable?.number) {
      setSelectedTableNumber(targetTable.number);
    }
  }, [targetTable]);

  // Auto-focus the input to trigger mobile Gboard keyboard immediately
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Ensure cursor at end
          const val = inputRef.current.value;
          inputRef.current.setSelectionRange(val.length, val.length);
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setSpokenText('');
      setSuccessToast(false);
    }
  }, [isOpen]);

  // Real-time Parser execution on text change
  const parsedResult = useMemo(() => {
    const res = parseGboardVoiceOrder(spokenText, products, tables);
    return res;
  }, [spokenText, products, tables]);

  // If table is detected in voice, auto-select it if user hasn't explicitly locked one
  useEffect(() => {
    if (parsedResult.tableNumber && !targetTable) {
      const found = tables.find(
        (t) => t.number.toLowerCase() === parsedResult.tableNumber?.toLowerCase()
      );
      if (found) {
        setSelectedTableNumber(found.number);
      }
    }
  }, [parsedResult.tableNumber, targetTable, tables]);

  // Editable parsed items list state so users can remove or adjust
  const [items, setItems] = useState<ParsedVoiceItem[]>([]);

  useEffect(() => {
    setItems(parsedResult.items);
  }, [parsedResult.items]);

  if (!isOpen) return null;

  // Single-touch Clear Text button
  const handleClearAll = () => {
    setSpokenText('');
    setItems([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Remove individual parsed item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update item quantity
  const handleUpdateItemQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((item): item is ParsedVoiceItem => item !== null)
    );
  };

  // Submit parsed items to POS cart / Order
  const handleConfirmOrder = () => {
    if (items.length === 0) return;

    const resolvedTable = tables.find((t) => t.number === selectedTableNumber) || tables[0];
    const targetTableId = resolvedTable ? resolvedTable.id : (targetTable?.id || 't-01');

    // If table is AVAILABLE, automatically open it
    if (resolvedTable && resolvedTable.status === 'AVAILABLE') {
      openTable(targetTableId, 2);
    }

    // Add each parsed item into POS store
    for (const item of items) {
      const productObj: FixtureProduct = item.matchedProduct || {
        id: `custom-prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        category: 'เมนูสั่งด่วน',
        categoryId: 'cat-quick',
        description: item.notes || 'สั่งผ่านเสียง Gboard Voice-to-POS',
        price: item.unitPrice,
        costPrice: Math.round(item.unitPrice * 0.4),
        sku: 'VOICE-QUICK',
        station: 'NOODLE_STATION',
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',
      };

      const mods: OrderItemModifierOption[] = item.modifiers.map((m) => ({
        groupName: m.groupName,
        optionName: m.optionName,
        price: m.price,
      }));

      addOrderItem(targetTableId, productObj, item.quantity, mods, item.notes);
    }

    if (isSentToKitchenDirectly) {
      sendOrderToKitchen(targetTableId);
    }

    setSuccessToast(true);
    setTimeout(() => {
      onClose();
      if (onOrderSubmitted) {
        onOrderSubmitted(targetTableId);
      }
    }, 600);
  };

  const calculatedGrandTotal = items.reduce((sum, it) => sum + it.totalPrice, 0);

  return (
    <div className='fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200'>
      <div className='bg-[#F4F6F5] rounded-t-4xl sm:rounded-4xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200'>
        {/* Top Header */}
        <div
          className='p-4 text-white shadow-md flex items-center justify-between shrink-0 relative overflow-hidden'
          style={{
            background: 'linear-gradient(135deg, #0C3B2E 0%, #175240 50%, #09261C 100%)',
          }}
        >
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-2xl bg-[#84CC16] text-[#072E20] flex items-center justify-center font-black shadow-md'>
              <Mic className='w-5 h-5 animate-pulse' />
            </div>
            <div>
              <h3 className='font-bold text-sm sm:text-base text-white flex items-center gap-2'>
                <span>สั่งออเดอร์ด้วยเสียง (Voice-to-POS)</span>
              </h3>
              <p className='text-[10.5px] text-emerald-200/90 font-medium flex items-center gap-1'>
                <span>ใช้ไมค์บนแป้นพิมพ์มือถือ (Gboard / iOS) แตะแล้วพูดได้ทันที</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className='w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className='p-4 overflow-y-auto space-y-3.5 flex-1 text-xs'>
          {/* Table Selector & Guide Banner */}
          <div className='flex items-center justify-between bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs gap-2'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='font-bold text-slate-700 whitespace-nowrap text-xs'>ลงบิลโต๊ะ:</span>
              <select
                value={selectedTableNumber}
                onChange={(e) => setSelectedTableNumber(e.target.value)}
                className='bg-emerald-50 text-[#0C3B2E] border border-emerald-300 font-black rounded-xl px-2.5 py-1 text-xs focus:outline-none cursor-pointer'
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.number}>
                    โต๊ะ {t.number} ({t.name})
                  </option>
                ))}
              </select>
            </div>

            {parsedResult.tableNumber && (
              <span className='px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 shrink-0'>
                ✓ ตรวจพบ: โต๊ะ {parsedResult.tableNumber}
              </span>
            )}
          </div>

          {/* Voice Input Box (Auto-Focuses to bring up Gboard) */}
          <div className='bg-white rounded-3xl p-3.5 border-2 border-emerald-500/50 shadow-md space-y-2 relative focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100 transition-all'>
            <div className='flex items-center justify-between'>
              <label className='font-bold text-slate-800 flex items-center gap-1.5 text-xs'>
                <Keyboard className='w-4 h-4 text-emerald-700' />
                <span>แตะปุ่มไมค์ 🎙️ บนแป้นพิมพ์ แล้วพูดสั่งได้เลย:</span>
              </label>

              {spokenText && (
                <button
                  type='button'
                  onClick={handleClearAll}
                  className='text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-lg border border-red-200 transition-colors'
                  title='ล้างข้อความทั้งหมดแล้วพูดใหม่'
                >
                  <RotateCcw className='w-3 h-3' />
                  <span>ล้างพูดใหม่</span>
                </button>
              )}
            </div>

            <textarea
              ref={inputRef}
              rows={3}
              value={spokenText}
              onChange={(e) => setSpokenText(e.target.value)}
              placeholder='ตัวอย่าง: "บะหมี่หยกเป็ดย่าง 2 ชาม พิเศษ ชาดำเย็น 2 โค้ก 20"'
              className='w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none resize-none leading-relaxed text-slate-800'
            />

            {/* Quick Voice Prompt Hints */}
            <div className='flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10.5px] text-slate-500'>
              <span className='font-bold text-slate-400 shrink-0'>ลองพูด:</span>
              <button
                type='button'
                onClick={() => setSpokenText((prev) => (prev ? prev + ' ' : '') + 'ก๋วยเตี๋ยวเป็ดพะโล้ 2 ชาม พิเศษ')}
                className='px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-full font-medium text-slate-700 shrink-0 cursor-pointer transition-colors'
              >
                "ก๋วยเตี๋ยวเป็ดพะโล้ 2 ชาม พิเศษ"
              </button>
              <button
                type='button'
                onClick={() => setSpokenText((prev) => (prev ? prev + ' ' : '') + 'ข้าวหน้าเป็ดย่าง 75 ชาดำเย็น 25')}
                className='px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-full font-medium text-slate-700 shrink-0 cursor-pointer transition-colors'
              >
                "ข้าวหน้าเป็ดย่าง 75 ชาดำเย็น 25"
              </button>
            </div>
          </div>

          {/* Real-time Parsed Results Preview Card */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between font-bold text-slate-800 text-xs px-1'>
              <span className='flex items-center gap-1.5'>
                <Sparkles className='w-3.5 h-3.5 text-amber-500' />
                <span>รายการที่ตรวจพบ ({items.length} รายการ):</span>
              </span>
              {items.length > 0 && (
                <span className='text-emerald-800 font-black text-sm'>
                  รวม ฿{calculatedGrandTotal.toFixed(2)}
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className='p-6 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-2 text-slate-400'>
                <div className='w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400'>
                  <Mic className='w-5 h-5' />
                </div>
                <p className='text-xs font-medium'>
                  ยังไม่มีรายการอาหาร — กดไมค์บนแป้นพิมพ์แล้วเริ่มพูดได้เลยครับ
                </p>
                <p className='text-[10px] text-slate-400'>
                  ระบบจะสกัดชื่อเมนู, จำนวนชาม, ความพิเศษ และราคาให้แบบ Real-time
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {items.map((it) => (
                  <div
                    key={it.id}
                    className='bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1'
                  >
                    {/* Delete item button */}
                    <button
                      type='button'
                      onClick={() => handleRemoveItem(it.id)}
                      className='w-7 h-7 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer shrink-0'
                      title='ลบรายการนี้'
                    >
                      <X className='w-3.5 h-3.5' />
                    </button>

                    {/* Item Details */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-1.5'>
                        {it.matchedProduct?.menuCode && (
                          <span className='px-1.5 py-0.5 rounded-md bg-[#0C3B2E] text-[#84CC16] font-mono font-black text-[10px] tracking-wide shrink-0'>
                            {it.matchedProduct.menuCode}
                          </span>
                        )}
                        <span className='font-bold text-slate-900 text-xs truncate'>
                          {it.name}
                        </span>
                        {it.matchedProduct && (
                          <span className='px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0C3B2E] text-[9px] font-bold'>
                            ตรงเมนูร้าน
                          </span>
                        )}
                      </div>

                      {/* Modifiers & Notes */}
                      <div className='flex flex-wrap items-center gap-1 mt-0.5 text-[10.5px] text-slate-500'>
                        {it.modifiers.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className='px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium'
                          >
                            +{m.optionName}
                          </span>
                        ))}
                        {it.notes && (
                          <span className='text-slate-400 text-[10px] italic'>
                            ({it.notes})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className='flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded-xl shrink-0'>
                      <button
                        type='button'
                        onClick={() => handleUpdateItemQty(it.id, -1)}
                        className='w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:bg-slate-200 font-bold active:scale-95'
                      >
                        -
                      </button>
                      <span className='font-black text-xs w-4 text-center text-slate-800'>
                        {it.quantity}
                      </span>
                      <button
                        type='button'
                        onClick={() => handleUpdateItemQty(it.id, 1)}
                        className='w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:bg-slate-200 font-bold active:scale-95'
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className='text-right shrink-0 min-w-[50px]'>
                      <span className='font-black text-sm text-[#D9531E]'>
                        ฿{it.totalPrice.toFixed(0)}
                      </span>
                      <span className='block text-[9.5px] text-slate-400'>
                        (@฿{it.unitPrice})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className='p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0'>
          <div className='flex items-center justify-between px-1 text-xs'>
            <label className='flex items-center gap-2 cursor-pointer text-slate-700 font-semibold select-none'>
              <input
                type='checkbox'
                checked={isSentToKitchenDirectly}
                onChange={(e) => setIsSentToKitchenDirectly(e.target.checked)}
                className='w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer'
              />
              <span>👨‍🍳 ส่งเข้าจอครัว KDS ทันทีหลังกดบันทึก</span>
            </label>

            <span className='font-black text-slate-900 text-sm'>
              รวม: <strong className='text-[#D9531E] text-base'>฿{calculatedGrandTotal.toFixed(2)}</strong>
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer active:scale-95'
            >
              ยกเลิก
            </button>

            <button
              type='button'
              disabled={items.length === 0}
              onClick={handleConfirmOrder}
              className={
                'flex-1 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer ' +
                (items.length > 0
                  ? 'bg-[#0C3B2E] hover:bg-[#072E20] text-white shadow-emerald-900/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed')
              }
            >
              {successToast ? (
                <>
                  <CheckCircle2 className='w-4 h-4 text-[#84CC16] animate-bounce' />
                  <span>บันทึกลงบิลเรียบร้อย!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className='w-4 h-4 text-[#84CC16]' />
                  <span>+ บันทึกลงบิลโต๊ะ {selectedTableNumber} ({items.length} รายการ)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
