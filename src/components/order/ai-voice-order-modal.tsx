'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRestaurant, StoreOrderItem, OrderItemModifierOption } from '@/lib/store/restaurant-store';
import { FixtureProduct, FIXTURE_MODIFIERS } from '@/lib/store/fixtures';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  ShoppingBag, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Volume2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface ParsedVoiceItem {
  id: string;
  product: FixtureProduct;
  quantity: number;
  modifiers: OrderItemModifierOption[];
  notes: string;
  lineTotal: number;
}

interface AIVoiceOrderModalProps {
  tableNumber: string;
  onClose: () => void;
  onAddItemsToCart: (items: ParsedVoiceItem[]) => void;
}

const SAMPLE_VOICE_PROMPTS = [
  'บะหมี่หยกเป็ดย่าง 2 ชาม เส้นเล็กเป็ดพะโล้พิเศษ 1 ชาม ชาดำเย็น 2 แก้ว',
  'ข้าวหน้าเป็ด 2 จาน เกาเหลาเป็ดตุ๋น 1 ชาม ไม่ใส่ถั่วงอก',
  'ก๋วยเตี๋ยวเป็ดเส้นใหญ่ 1 ชาม ต้มซุปเปอร์ 1 หม้อ น้ำเก๊กฮวย 2 แก้ว หวานน้อย',
];

export function AIVoiceOrderModal({ tableNumber, onClose, onAddItemsToCart }: AIVoiceOrderModalProps) {
  const { products } = useRestaurant();

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedVoiceItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // 1. Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'th-TH';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('🎙️ กำลังฟังเสียงพูดภาษาไทย... (พูดสั่งอาหารได้เลย)');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setTranscript(currentTranscript);
          parseThaiSpeechToOrder(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setStatusMessage('⚠️ กรุณากดอนุญาตการใช้งานไมโครโฟนในเบราว์เซอร์');
        } else {
          setStatusMessage('⚠️ ไม่ได้ยินเสียงพูด ลองใหม่อีกครั้ง');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;

      // Auto start on mount
      try {
        recognition.start();
      } catch (_) {}
    } catch (err) {
      console.warn('SpeechRecognition init error:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [products]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('เบราว์เซอร์ของคุณยังไม่รองรับ Web Speech API กรุณาใช้ Google Chrome หรือ Safari ครับ');
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (_) {}
      setIsListening(true);
    }
  };

  // 2. Thai Natural Language Processing (NLP) Parser
  const parseThaiSpeechToOrder = (rawText: string) => {
    const text = rawText.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ');
    const results: ParsedVoiceItem[] = [];

    // Helper: Parse Thai Numbers
    const parseNumber = (segment: string): number => {
      if (segment.includes('10') || segment.includes('สิบ')) return 10;
      if (segment.includes('9') || segment.includes('เก้า')) return 9;
      if (segment.includes('8') || segment.includes('แปด')) return 8;
      if (segment.includes('7') || segment.includes('เจ็ด')) return 7;
      if (segment.includes('6') || segment.includes('หก')) return 6;
      if (segment.includes('5') || segment.includes('ห้า')) return 5;
      if (segment.includes('4') || segment.includes('สี่')) return 4;
      if (segment.includes('3') || segment.includes('สาม')) return 3;
      if (segment.includes('2') || segment.includes('สอง')) return 2;
      if (segment.includes('1') || segment.includes('หนึ่ง')) return 1;
      const match = segment.match(/\d+/);
      return match ? parseInt(match[0], 10) : 1;
    };

    // Match each product
    products.forEach((prod) => {
      const prodName = prod.name.toLowerCase();
      // Keywords to check
      const keywords = [
        prodName,
        prodName.replace(/ก๋วยเตี๋ยว/g, '').trim(),
        prodName.replace(/บะหมี่/g, '').trim(),
        prodName.replace(/ข้าว/g, '').trim(),
      ].filter((k) => k.length >= 3);

      const hasMatch = keywords.some((k) => text.includes(k));

      if (hasMatch) {
        // Extract context window around the matched product name
        const matchIdx = text.indexOf(keywords.find((k) => text.includes(k)) || prodName);
        const contextChunk = text.slice(Math.max(0, matchIdx - 15), Math.min(text.length, matchIdx + 45));

        const qty = parseNumber(contextChunk);

        // Detect Modifiers
        const modifiers: OrderItemModifierOption[] = [];
        let modDelta = 0;

        // Noodle Types
        if (contextChunk.includes('เส้นเล็ก')) modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'เส้นเล็ก', price: 0 });
        else if (contextChunk.includes('เส้นใหญ่')) modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'เส้นใหญ่', price: 0 });
        else if (contextChunk.includes('บะหมี่หยก')) { modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'บะหมี่หยก', price: 5 }); modDelta += 5; }
        else if (contextChunk.includes('บะหมี่') || contextChunk.includes('หมี่เหลือง')) modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'บะหมี่ไข่เหลือง', price: 0 });
        else if (contextChunk.includes('เส้นหมี่')) modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'เส้นหมี่ขาว', price: 0 });
        else if (contextChunk.includes('เกาเหลา')) modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'เกาเหลา (ไม่ใส่เส้น)', price: 0 });

        // Size
        if (contextChunk.includes('จัมโบ้')) { modifiers.push({ groupName: 'ระดับความพิเศษ', optionName: 'จัมโบ้', price: 30 }); modDelta += 30; }
        else if (contextChunk.includes('พิเศษ')) { modifiers.push({ groupName: 'ระดับความพิเศษ', optionName: 'พิเศษ', price: 15 }); modDelta += 15; }

        // Spicy
        if (contextChunk.includes('ไม่เผ็ด') || contextChunk.includes('ไม่พริก')) modifiers.push({ groupName: 'ความเผ็ด', optionName: 'ไม่เผ็ด', price: 0 });
        else if (contextChunk.includes('เผ็ดน้อย')) modifiers.push({ groupName: 'ความเผ็ด', optionName: 'เผ็ดน้อย', price: 0 });
        else if (contextChunk.includes('เผ็ดมาก')) modifiers.push({ groupName: 'ความเผ็ด', optionName: 'เผ็ดมาก', price: 0 });

        // Drinks sweetness
        if (contextChunk.includes('หวานน้อย')) modifiers.push({ groupName: 'ความหวาน', optionName: 'หวานน้อย (50%)', price: 0 });
        else if (contextChunk.includes('ไม่หวาน')) modifiers.push({ groupName: 'ความหวาน', optionName: 'ไม่หวาน (0%)', price: 0 });
        else if (contextChunk.includes('แยกน้ำแข็ง')) { modifiers.push({ groupName: 'น้ำแข็ง', optionName: 'แยกน้ำแข็ง', price: 5 }); modDelta += 5; }

        // Notes
        const notesList: string[] = [];
        if (text.includes('ไม่ใส่ถั่วงอก') || text.includes('ไม่ถั่วงอก')) notesList.push('ไม่ใส่ถั่วงอก');
        if (text.includes('ไม่ใส่กระเทียมเจียว') || text.includes('ไม่กระเทียม')) notesList.push('ไม่ใส่กระเทียมเจียว');
        if (text.includes('แยกน้ำซุป') || text.includes('แยกน้ำ')) notesList.push('แยกน้ำซุป');
        if (text.includes('ผักชีเยอะ') || text.includes('ใส่ผักเยอะ')) notesList.push('ผักเยอะๆ');
        if (text.includes('ขอน้ำจิ้ม') || text.includes('ขอน้ำราด')) notesList.push('ขอน้ำจิ้มเพิ่ม');

        const lineTotal = (prod.price + modDelta) * qty;

        results.push({
          id: 'voice-' + prod.id + '-' + Date.now(),
          product: prod,
          quantity: qty,
          modifiers,
          notes: notesList.join(', '),
          lineTotal,
        });
      }
    });

    setParsedItems(results);
  };

  const handleApplyPreset = (promptText: string) => {
    setTranscript(promptText);
    parseThaiSpeechToOrder(promptText);
  };

  const updateItemQty = (idx: number, delta: number) => {
    setParsedItems((prev) =>
      prev
        .map((item, i) => {
          if (i === idx) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = item.product.price + item.modifiers.reduce((s, m) => s + m.price, 0);
            return {
              ...item,
              quantity: newQty,
              lineTotal: unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as ParsedVoiceItem[]
    );
  };

  const handleConfirmAddToCart = () => {
    if (parsedItems.length === 0) return;
    onAddItemsToCart(parsedItems);
    onClose();
  };

  const grandTotal = parsedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div 
      onClick={onClose}
      className='fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200'
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className='bg-white rounded-4xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-emerald-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200'
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-emerald-100 pb-3'>
          <div className='flex items-center space-x-2.5 text-[#0C3B2E]'>
            <div className='w-9 h-9 rounded-2xl bg-emerald-100 text-[#0C3B2E] flex items-center justify-center shadow-xs'>
              <Sparkles className='w-5 h-5 text-[#84CC16]' />
            </div>
            <div>
              <div className='font-black text-base sm:text-lg text-slate-900 flex items-center gap-1.5'>
                <span>AI สั่งอาหารด้วยเสียง</span>
                <span className='text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold'>
                  โต๊ะ {tableNumber}
                </span>
              </div>
              <div className='text-[10.5px] text-slate-500 font-normal'>
                พูดชื่อเมนู, ชนิดเส้น, จำนวนจาน และหมายเหตุ ระบบจะหยิบลงบิลอัตโนมัติ
              </div>
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

        {/* Central Audio Microphone Button */}
        <div className='py-4 flex flex-col items-center justify-center text-center space-y-3 bg-gradient-to-b from-emerald-50/60 to-white rounded-3xl border border-emerald-100 p-4'>
          <button
            type='button'
            onClick={toggleListening}
            className={
              'w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 cursor-pointer relative ' +
              (isListening
                ? 'bg-red-500 ring-8 ring-red-200 animate-pulse'
                : 'bg-[#0C3B2E] hover:bg-[#072E20] ring-4 ring-emerald-200')
            }
          >
            {isListening ? (
              <Mic className='w-9 h-9 animate-bounce' />
            ) : (
              <Mic className='w-9 h-9 text-[#84CC16]' />
            )}
            {isListening && (
              <span className='absolute -bottom-1 w-3 h-3 bg-red-400 rounded-full animate-ping' />
            )}
          </button>

          <div>
            <div className='font-bold text-xs sm:text-sm text-slate-800'>
              {isListening ? '🎙️ กำลังฟังเสียงพูด... (พูดต่อเนื่องได้เลย)' : 'แตะไมค์แล้วเริ่มพูดสั่งอาหาร'}
            </div>
            {statusMessage && (
              <div className='text-[11px] text-emerald-700 font-medium mt-0.5'>{statusMessage}</div>
            )}
          </div>

          {/* Live Transcript Box */}
          <div className='w-full min-h-[50px] p-3 bg-white rounded-2xl border border-slate-200 text-left text-xs font-medium text-slate-800 shadow-inner flex items-center'>
            {transcript ? (
              <p className='leading-relaxed font-semibold text-[#0C3B2E]'>
                &ldquo;{transcript}&rdquo;
              </p>
            ) : (
              <p className='text-slate-400 italic text-[11px]'>
                ข้อความเสียงพูดจะปรากฏตรงนี้ เช่น &ldquo;เอาเส้นเล็กเป็ดตุ๋น 2 ชาม ชาดำเย็น 1 แก้ว&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Sample Voice Prompts (Quick Click to Test) */}
        <div className='space-y-1.5'>
          <div className='text-[10.5px] font-bold text-slate-500 flex items-center gap-1'>
            <Volume2 className='w-3 h-3 text-[#0C3B2E]' />
            <span>ตัวอย่างประโยคพูด (แตะเพื่อทดสอบด่วน):</span>
          </div>
          <div className='flex flex-col gap-1'>
            {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type='button'
                onClick={() => handleApplyPreset(prompt)}
                className='text-left px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-[11px] font-medium text-slate-700 hover:text-[#0C3B2E] rounded-xl border border-slate-200 transition-colors cursor-pointer truncate'
              >
                💬 &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Parsed Items Preview List */}
        <div className='space-y-2 pt-2 border-t border-slate-100'>
          <div className='flex items-center justify-between text-xs'>
            <span className='font-bold text-slate-800 flex items-center gap-1.5'>
              <Check className='w-4 h-4 text-emerald-600' />
              <span>รายการอาหารที่ AI ตรวจจับได้ ({parsedItems.length} รายการ):</span>
            </span>
            {parsedItems.length > 0 && (
              <span className='font-black text-[#D9531E]'>฿{grandTotal.toFixed(2)}</span>
            )}
          </div>

          {parsedItems.length > 0 ? (
            <div className='space-y-1.5 max-h-48 overflow-y-auto pr-1'>
              {parsedItems.map((item, idx) => (
                <div
                  key={idx}
                  className='p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 animate-in fade-in'
                >
                  <div className='flex-1 truncate'>
                    <div className='font-bold text-slate-900 text-xs truncate'>{item.product.name}</div>
                    <div className='flex flex-wrap gap-1 mt-0.5 text-[10px]'>
                      {item.modifiers.map((m, mIdx) => (
                        <span key={mIdx} className='bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded-md font-semibold'>
                          {m.optionName} {m.price > 0 && `(+฿${m.price})`}
                        </span>
                      ))}
                      {item.notes && (
                        <span className='bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md font-semibold'>
                          * {item.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className='flex items-center space-x-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs'>
                    <button
                      type='button'
                      onClick={() => updateItemQty(idx, -1)}
                      className='w-5 h-5 flex items-center justify-center font-black text-slate-600 hover:bg-slate-100 rounded cursor-pointer'
                    >
                      -
                    </button>
                    <span className='font-bold text-xs w-4 text-center'>{item.quantity}</span>
                    <button
                      type='button'
                      onClick={() => updateItemQty(idx, 1)}
                      className='w-5 h-5 flex items-center justify-center font-black text-slate-600 hover:bg-slate-100 rounded cursor-pointer'
                    >
                      +
                    </button>
                  </div>

                  <span className='font-black text-slate-800 text-xs w-16 text-right'>
                    ฿{item.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className='p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs'>
              ยังไม่มีรายการอาหาร — ลองแตะไมค์แล้วพูด หรือแตะประโยคตัวอย่างด้านบน
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className='pt-2 flex items-center justify-end gap-2 border-t border-slate-100'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs cursor-pointer'
          >
            ปิด
          </button>

          <button
            type='button'
            disabled={parsedItems.length === 0}
            onClick={handleConfirmAddToCart}
            className={
              'px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer ' +
              (parsedItems.length > 0
                ? 'bg-[#D9531E] hover:bg-[#B45309] text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed')
            }
          >
            <ShoppingBag className='w-4 h-4' />
            <span>ใส่ลงบิลทันที ({parsedItems.length} เมนู • ฿{grandTotal.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
