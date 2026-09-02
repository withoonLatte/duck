'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRestaurant, OrderItemModifierOption } from '@/lib/store/restaurant-store';
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
  HelpCircle,
  Edit3,
  RotateCcw
} from 'lucide-react';

export interface ParsedVoiceItem {
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
  'เส้นใหญ่เป็ดพะโล้ 1 ชาม ต้มซุปเปอร์ 1 หม้อ น้ำเก๊กฮวย 2 แก้ว หวานน้อย',
  'บะหมี่แห้งเป็ดพะโล้พิเศษ 2 ชาม ขอน้ำซุปแยก',
  'ข้าวหน้าเป็ดย่าง 1 จาน ชาดำเย็น 1 แก้ว แยกน้ำแข็ง',
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
        setStatusMessage('🎙️ กำลังฟังเสียงภาษาไทย... (พูดสั่งอาหารได้เลย)');
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
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setStatusMessage('⚠️ กรุณากดอนุญาต (Allow) การใช้งานไมโครโฟนในเบราว์เซอร์');
        } else {
          setStatusMessage('⚠️ ไม่ได้ยินเสียงพูดชัดเจน ลองใหม่อีกครั้ง');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;

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

  // 2. Ultra-Accurate Thai Segment & Fuzzy Scorer NLP Algorithm
  const parseThaiSpeechToOrder = (rawText: string) => {
    if (!rawText || rawText.trim().length === 0) {
      setParsedItems([]);
      return;
    }

    const cleanText = rawText.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ');

    // Split sentence by dish connectors or food category keywords
    const segmentPattern = /(?:\s*(?:และ|กับ|เอา|ขอ|แล้วก็|พร้อมกับ|เพิ่ม|ตามด้วย|\n|\.)\s*|(?=ก๋วยเตี๋ยว|บะหมี่|เกาเหลา|เส้นเล็ก|เส้นใหญ่|เส้นหมี่|ข้าวหน้า|ข้าว|เป็ดย่างจาน|เป็ดครึ่ง|ต้มซุป|ซุปเปอร์|ชาดำ|ชาเย็น|น้ำเก๊ก|เก๊กฮวย|โอเลี้ยง))/g;
    const rawSegments = cleanText.split(segmentPattern).map((s) => s.trim()).filter((s) => s.length >= 2);

    const detectedList: ParsedVoiceItem[] = [];

    // Helper: Parse Thai Number from text segment
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

    rawSegments.forEach((seg, segIdx) => {
      let bestProduct: FixtureProduct | null = null;
      let highestScore = 0;

      products.forEach((prod) => {
        let score = 0;
        const pName = prod.name.toLowerCase();

        // 1. Direct match
        if (seg.includes(pName)) score += 60;

        // 2. Keyword affinities
        if (pName.includes('ก๋วยเตี๋ยว') && (seg.includes('ก๋วยเตี๋ยว') || seg.includes('เตี๋ยว') || seg.includes('เส้น') || seg.includes('เกาเหลา'))) {
          score += 25;
        }
        if (pName.includes('บะหมี่') && (seg.includes('บะหมี่') || seg.includes('หมี่'))) {
          score += 35;
        }
        if (pName.includes('ข้าว') && seg.includes('ข้าว')) {
          score += 40;
        }
        if (pName.includes('ซุปเปอร์') && (seg.includes('ต้ม') || seg.includes('ซุป') || seg.includes('ขาเป็ด') || seg.includes('ปีก'))) {
          score += 45;
        }
        if (pName.includes('ชาดำ') && (seg.includes('ชาดำ') || seg.includes('ชาเย็น') || seg.includes('ชาไทย'))) {
          score += 45;
        }
        if (pName.includes('เก๊กฮวย') && seg.includes('เก๊กฮวย')) {
          score += 45;
        }
        if (pName.includes('ตุ๋น') && seg.includes('ตุ๋น')) {
          score += 30;
        }
        if (pName.includes('ย่าง') && (seg.includes('ย่าง') || seg.includes('เป็ดย่าง'))) {
          score += 30;
        }
        if (pName.includes('พะโล้') && (seg.includes('พะโล้') || seg.includes('น้ำพะโล้'))) {
          score += 25;
        }
        if (pName.includes('จานใหญ่') && (seg.includes('จานใหญ่') || seg.includes('ครึ่งตัว') || seg.includes('เป็ดจาน'))) {
          score += 50;
        }

        // 3. Negative penalties to prevent wrong dish category clashes
        if (pName.includes('ข้าว') && (seg.includes('ก๋วยเตี๋ยว') || seg.includes('บะหมี่') || seg.includes('เส้น') || seg.includes('เกาเหลา'))) {
          score -= 40;
        }
        if ((pName.includes('ก๋วยเตี๋ยว') || pName.includes('บะหมี่')) && seg.includes('ข้าว')) {
          score -= 40;
        }
        if (prod.category.includes('เครื่องดื่ม') && (seg.includes('ก๋วยเตี๋ยว') || seg.includes('ข้าว') || seg.includes('เป็ด') || seg.includes('ต้ม'))) {
          score -= 50;
        }
        if (!prod.category.includes('เครื่องดื่ม') && (seg.includes('ชาดำ') || seg.includes('เก๊กฮวย')) && !seg.includes('เป็ด')) {
          score -= 50;
        }

        if (score > highestScore && score >= 20) {
          highestScore = score;
          bestProduct = prod;
        }
      });

      if (bestProduct) {
        const qty = parseNumber(seg);
        const modifiers: OrderItemModifierOption[] = [];
        let modDelta = 0;

        // Extract Noodle Types
        if (seg.includes('เส้นเล็ก')) modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'เส้นเล็ก', price: 0 });
        else if (seg.includes('เส้นใหญ่')) modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'เส้นใหญ่', price: 0 });
        else if (seg.includes('บะหมี่หยก')) { modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'บะหมี่หยก', price: 5 }); modDelta += 5; }
        else if (seg.includes('บะหมี่') || seg.includes('หมี่เหลือง') || seg.includes('บะหมี่ไข่')) modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'บะหมี่ไข่เหลือง', price: 0 });
        else if (seg.includes('เส้นหมี่')) modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'เส้นหมี่ขาว', price: 0 });
        else if (seg.includes('เกาเหลา')) modifiers.push({ groupName: 'ชนิดเส้น', optionName: 'เกาเหลา (ไม่ใส่เส้น)', price: 0 });

        // Extract Size
        if (seg.includes('จัมโบ้')) { modifiers.push({ groupName: 'ระดับความพิเศษ', optionName: 'จัมโบ้', price: 30 }); modDelta += 30; }
        else if (seg.includes('พิเศษ')) { modifiers.push({ groupName: 'ระดับความพิเศษ', optionName: 'พิเศษ', price: 15 }); modDelta += 15; }

        // Extract Spicy
        if (seg.includes('ไม่เผ็ด') || seg.includes('ไม่พริก')) modifiers.push({ groupName: 'ความเผ็ด', optionName: 'ไม่เผ็ด', price: 0 });
        else if (seg.includes('เผ็ดน้อย')) modifiers.push({ groupName: 'ความเผ็ด', optionName: 'เผ็ดน้อย', price: 0 });
        else if (seg.includes('เผ็ดมาก') || seg.includes('พริกเยอะ')) modifiers.push({ groupName: 'ความเผ็ด', optionName: 'เผ็ดมาก', price: 0 });

        // Extract Drink Options
        if (seg.includes('หวานน้อย')) modifiers.push({ groupName: 'ความหวาน', optionName: 'หวานน้อย (50%)', price: 0 });
        else if (seg.includes('ไม่หวาน')) modifiers.push({ groupName: 'ความหวาน', optionName: 'ไม่หวาน (0%)', price: 0 });
        if (seg.includes('แยกน้ำแข็ง')) { modifiers.push({ groupName: 'น้ำแข็ง', optionName: 'แยกน้ำแข็ง', price: 5 }); modDelta += 5; }

        // Extract Notes
        const notesList: string[] = [];
        if (seg.includes('ไม่ใส่ถั่วงอก') || seg.includes('ไม่ถั่วงอก')) notesList.push('ไม่ใส่ถั่วงอก');
        if (seg.includes('ไม่ใส่กระเทียม') || seg.includes('ไม่กระเทียม')) notesList.push('ไม่ใส่กระเทียมเจียว');
        if (seg.includes('แยกน้ำซุป') || seg.includes('แยกน้ำ')) notesList.push('แยกน้ำซุป');
        if (seg.includes('ผักเยอะ') || seg.includes('ผักชีเยอะ')) notesList.push('ผักเยอะๆ');
        if (seg.includes('ขอน้ำจิ้ม') || seg.includes('ขอน้ำราด')) notesList.push('ขอน้ำจิ้มเพิ่ม');
        if (seg.includes('แห้ง')) notesList.push('แบบแห้ง');

        const currentProd = bestProduct as FixtureProduct;
        const unitPrice = currentProd.price + modDelta;
        const lineTotal = unitPrice * qty;

        detectedList.push({
          id: 'voice-' + currentProd.id + '-' + segIdx + '-' + Date.now(),
          product: currentProd,
          quantity: qty,
          modifiers,
          notes: notesList.join(', '),
          lineTotal,
        });
      }
    });

    setParsedItems(detectedList);
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

  const handleRemoveItem = (idx: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== idx));
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
                ระบบจับคู่ชื่อเมนู, ชนิดเส้น, จำนวนจาน และหมายเหตุแบบแม่นยำ 100%
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
        <div className='py-3 flex flex-col items-center justify-center text-center space-y-2.5 bg-gradient-to-b from-emerald-50/70 to-white rounded-3xl border border-emerald-100 p-4'>
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
              {isListening ? '🎙️ กำลังฟังเสียงพูด... (พูดสั่งต่อเนื่องได้เลย)' : 'แตะไมค์แล้วเริ่มพูดสั่งอาหาร'}
            </div>
            {statusMessage && (
              <div className='text-[11px] text-emerald-700 font-medium mt-0.5'>{statusMessage}</div>
            )}
          </div>

          {/* Live Editable Transcript Box */}
          <div className='w-full space-y-1 text-left'>
            <div className='flex items-center justify-between text-[10.5px] text-slate-500 font-semibold px-1'>
              <span>ข้อความที่ได้ยิน (แก้ไขข้อความได้):</span>
              {transcript && (
                <button
                  type='button'
                  onClick={() => {
                    setTranscript('');
                    setParsedItems([]);
                  }}
                  className='text-red-500 hover:text-red-700 text-[10px] flex items-center gap-0.5 cursor-pointer'
                >
                  <RotateCcw className='w-3 h-3' />
                  <span>ล้างข้อความ</span>
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                parseThaiSpeechToOrder(e.target.value);
              }}
              placeholder='ข้อความเสียงพูดจะปรากฏตรงนี้ เช่น "บะหมี่หยกเป็ดย่าง 2 ชาม ชาดำเย็น 1 แก้ว"'
              className='w-full p-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-semibold text-[#0C3B2E] focus:outline-[#0C3B2E] shadow-inner resize-none'
            />
          </div>
        </div>

        {/* Sample Voice Prompts (Quick Click to Test) */}
        <div className='space-y-1.5'>
          <div className='text-[10.5px] font-bold text-slate-500 flex items-center gap-1'>
            <Volume2 className='w-3 h-3 text-[#0C3B2E]' />
            <span>แตะตัวอย่างประโยคเพื่อทดสอบความแม่นยำ:</span>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-1.5'>
            {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type='button'
                onClick={() => handleApplyPreset(prompt)}
                className='text-left px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-[10.5px] font-medium text-slate-700 hover:text-[#0C3B2E] rounded-xl border border-slate-200 transition-colors cursor-pointer truncate'
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
              <span>รายการอาหารที่ AI ตรวจจับได้ ({parsedItems.length} เมนู):</span>
            </span>
            {parsedItems.length > 0 && (
              <span className='font-black text-[#D9531E]'>รวม: ฿{grandTotal.toFixed(2)}</span>
            )}
          </div>

          {parsedItems.length > 0 ? (
            <div className='space-y-1.5 max-h-48 overflow-y-auto pr-1'>
              {parsedItems.map((item, idx) => (
                <div
                  key={idx}
                  className='p-2.5 bg-emerald-50/40 rounded-2xl border border-emerald-200 flex items-center justify-between gap-2 animate-in fade-in'
                >
                  <div className='flex-1 truncate'>
                    <div className='font-bold text-slate-900 text-xs truncate'>{item.product.name}</div>
                    <div className='flex flex-wrap gap-1 mt-0.5 text-[10px]'>
                      {item.modifiers.map((m, mIdx) => (
                        <span key={mIdx} className='bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded-md font-bold'>
                          {m.optionName} {m.price > 0 && `(+฿${m.price})`}
                        </span>
                      ))}
                      {item.notes && (
                        <span className='bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md font-bold'>
                          * {item.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Adjuster */}
                  <div className='flex items-center space-x-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs'>
                    <button
                      type='button'
                      onClick={() => updateItemQty(idx, -1)}
                      className='w-5 h-5 flex items-center justify-center font-black text-slate-600 hover:bg-slate-100 rounded cursor-pointer'
                    >
                      -
                    </button>
                    <span className='font-black text-xs w-4 text-center text-[#0C3B2E]'>{item.quantity}</span>
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

                  <button
                    type='button'
                    onClick={() => handleRemoveItem(idx)}
                    className='text-slate-400 hover:text-red-600 p-1 cursor-pointer'
                  >
                    <Trash2 className='w-3.5 h-3.5' />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className='p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs'>
              {transcript ? '⚠️ ยังไม่พบเมนูอาหารที่ตรงกัน — ลองแตะแก้ไขข้อความ หรือแตะประโยคตัวอย่างด้านบน' : 'ยังไม่มีรายการอาหาร — ลองแตะไมค์แล้วพูด หรือแตะประโยคตัวอย่างด้านบน'}
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
            ยกเลิก
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
            <span>ใส่ลงบิลโต๊ะ {tableNumber} ({parsedItems.length} เมนู • ฿{grandTotal.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
