import { FixtureProduct } from '@/lib/store/fixtures';

export interface ParsedVoiceItem {
  id: string;
  matchedProduct: FixtureProduct | null;
  rawText: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers: { groupName: string; optionName: string; price: number }[];
  notes?: string;
  confidence: number; // 0 to 1
}

export interface ParsedVoiceResult {
  tableNumber?: string;
  items: ParsedVoiceItem[];
  unmatchedPhrases: string[];
  totalAmount: number;
}

// Helper to convert Thai number words to integer
function thaiWordToNumber(word: string): number | null {
  const map: Record<string, number> = {
    'หนึ่ง': 1, 'เอ็ด': 1, '1': 1,
    'สอง': 2, 'โท': 2, '2': 2,
    'สาม': 3, '3': 3,
    'สี่': 4, '4': 4,
    'ห้า': 5, '5': 5,
    'หก': 6, '6': 6,
    'เจ็ด': 7, '7': 7,
    'แปด': 8, '8': 8,
    'เก้า': 9, '9': 9,
    'สิบ': 10, '10': 10,
    'ยี่สิบ': 20, '20': 20,
    'สามสิบ': 30, '30': 30,
    'สี่สิบ': 40, '40': 40,
    'ห้าสิบ': 50, '50': 50,
  };
  return map[word.trim()] ?? null;
}

export function parseGboardVoiceOrder(
  rawInput: string,
  availableProducts: FixtureProduct[],
  availableTables: { number: string; id: string }[] = []
): ParsedVoiceResult {
  let text = rawInput.trim();
  if (!text) {
    return { items: [], unmatchedPhrases: [], totalAmount: 0 };
  }

  // 1. Detect Table Number (e.g. "โต๊ะ 5", "โต๊ะ5", "โต๊ะ 02", "โต๊ะสอง")
  let detectedTable: string | undefined = undefined;
  const tableMatch = text.match(/โต๊ะ\s*([0-9]+|[ก-๙]+)/i);
  if (tableMatch) {
    const tableVal = tableMatch[1].trim();
    const numVal = parseInt(tableVal, 10);
    if (!isNaN(numVal)) {
      // Find matching table or format as T0X
      const found = availableTables.find(
        (t) => t.number.replace(/\D/g, '') === String(numVal) || t.number.toLowerCase() === `t${numVal}`
      );
      detectedTable = found ? found.number : `T${String(numVal).padStart(2, '0')}`;
    } else {
      const parsedNum = thaiWordToNumber(tableVal);
      if (parsedNum !== null) {
        const found = availableTables.find(
          (t) => t.number.replace(/\D/g, '') === String(parsedNum) || t.number.toLowerCase() === `t${parsedNum}`
        );
        detectedTable = found ? found.number : `T${String(parsedNum).padStart(2, '0')}`;
      } else {
        detectedTable = tableVal.toUpperCase();
      }
    }
    // Remove table phrase from parsing text so it doesn't pollute menu items
    text = text.replace(/โต๊ะ\s*([0-9]+|[ก-๙]+)/i, ' ').trim();
  }

  // 2. Normalize and Split into Sub-phrases
  // Connectors: "และ", "กับ", "แล้วก็", "เอา", "ขอ", "เพิ่ม", "\n", ",", ";"
  // Also split on common Thai punctuation or line breaks
  const splitRegex = /(?:[\n\r,;+]|\s+(?:และ|กับ|แล้วก็|เอา|ขอ|เพิ่ม)\s+)/gi;
  let phrases = text
    .split(splitRegex)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // If there's only 1 long phrase without connectors, attempt heuristic split on price patterns: "xxx 60 yyy 20"
  // E.g. "ข้าวมันไก่พิเศษ 60 โค้ก 20" -> ["ข้าวมันไก่พิเศษ 60", "โค้ก 20"]
  if (phrases.length === 1 && /\d+\s*(?:บาท)?\s+[ก-๙a-zA-Z]/i.test(phrases[0])) {
    const multiMatch = phrases[0].split(/(?<=\d+(?:\s*บาท)?)\s+(?=[ก-๙a-zA-Z])/g);
    if (multiMatch.length > 1) {
      phrases = multiMatch.map((m) => m.trim()).filter((m) => m.length > 0);
    }
  }

  const parsedItems: ParsedVoiceItem[] = [];
  const unmatched: string[] = [];

  for (let idx = 0; idx < phrases.length; idx++) {
    const phrase = phrases[idx];
    if (!phrase) continue;

    // A. Extract Price if spoken (e.g. "60 บาท", "100 บ.", " 60")
    // Note: ensure price doesn't confuse with quantity (price usually >= 15 or followed by บาท)
    let explicitPrice: number | null = null;
    let workingPhrase = phrase;

    const priceWithUnitMatch = workingPhrase.match(/(\d+)\s*(?:บาท|บ\.)/i);
    if (priceWithUnitMatch) {
      explicitPrice = parseInt(priceWithUnitMatch[1], 10);
      workingPhrase = workingPhrase.replace(priceWithUnitMatch[0], ' ').trim();
    } else {
      // Check for standalone trailing numbers >= 15 as likely price
      const trailingNumMatch = workingPhrase.match(/\s+(\d{2,4})\s*$/);
      if (trailingNumMatch) {
        explicitPrice = parseInt(trailingNumMatch[1], 10);
        workingPhrase = workingPhrase.slice(0, trailingNumMatch.index).trim();
      }
    }

    // B. Extract Quantity (e.g. "2 ชาม", "3 แก้ว", "2 ถุง", "2 ที่", "2", "สองแก้ว", "2 จาน")
    let quantity = 1;
    const qtyWithUnitMatch = workingPhrase.match(/(\d+)\s*(?:ชาม|แก้ว|ถุง|ที่|จาน|อัน|กล่อง|ขวด|ห่อ|ชุด|ชิ้น)/i);
    if (qtyWithUnitMatch) {
      quantity = Math.max(1, parseInt(qtyWithUnitMatch[1], 10));
      workingPhrase = workingPhrase.replace(qtyWithUnitMatch[0], ' ').trim();
    } else {
      // Check for Thai words like "สองชาม", "สามแก้ว"
      const thaiWordQtyMatch = workingPhrase.match(/(หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า|สิบ)\s*(?:ชาม|แก้ว|ถุง|ที่|จาน|อัน|กล่อง|ขวด|ห่อ|ชุด)/i);
      if (thaiWordQtyMatch) {
        const qNum = thaiWordToNumber(thaiWordQtyMatch[1]);
        if (qNum) quantity = qNum;
        workingPhrase = workingPhrase.replace(thaiWordQtyMatch[0], ' ').trim();
      } else {
        // Standalone number <= 10 treated as quantity
        const smallNumMatch = workingPhrase.match(/(?:^|\s+)([1-9]|10)(?:\s+|$)/);
        if (smallNumMatch) {
          quantity = parseInt(smallNumMatch[1], 10);
          workingPhrase = workingPhrase.replace(smallNumMatch[0], ' ').trim();
        }
      }
    }

    // C. Check Modifiers (e.g. "พิเศษ", "จัมโบ้", "บะหมี่หยก", "เส้นเล็ก", "เส้นใหญ่", "เกาเหลา", "หวานน้อย", "ไม่เผ็ด")
    const modifiers: { groupName: string; optionName: string; price: number }[] = [];
    if (/พิเศษ/i.test(workingPhrase)) {
      modifiers.push({ groupName: 'ความพิเศษ', optionName: 'พิเศษ (+15฿)', price: 15 });
      workingPhrase = workingPhrase.replace(/พิเศษ/gi, ' ').trim();
    } else if (/จัมโบ้/i.test(workingPhrase)) {
      modifiers.push({ groupName: 'ความพิเศษ', optionName: 'จัมโบ้ (+30฿)', price: 30 });
      workingPhrase = workingPhrase.replace(/จัมโบ้/gi, ' ').trim();
    }

    // Noodle types
    if (/บะหมี่หยก/i.test(workingPhrase)) {
      modifiers.push({ groupName: 'เลือกเส้น', optionName: 'บะหมี่หยก', price: 5 });
    } else if (/เส้นเล็ก/i.test(workingPhrase)) {
      modifiers.push({ groupName: 'เลือกเส้น', optionName: 'เส้นเล็ก', price: 0 });
    } else if (/เส้นใหญ่/i.test(workingPhrase)) {
      modifiers.push({ groupName: 'เลือกเส้น', optionName: 'เส้นใหญ่', price: 0 });
    } else if (/เกาเหลา/i.test(workingPhrase)) {
      modifiers.push({ groupName: 'เลือกเส้น', optionName: 'เกาเหลา (ไม่ใส่เส้น)', price: 0 });
    } else if (/หมี่ขาว/i.test(workingPhrase)) {
      modifiers.push({ groupName: 'เลือกเส้น', optionName: 'เส้นหมี่ขาว', price: 0 });
    }

    // Sweetness / Spicy
    if (/หวานน้อย/i.test(workingPhrase)) {
      modifiers.push({ groupName: 'ความหวาน', optionName: 'หวานน้อย (50%)', price: 0 });
    } else if (/ไม่หวาน/i.test(workingPhrase)) {
      modifiers.push({ groupName: 'ความหวาน', optionName: 'ไม่หวาน (0%)', price: 0 });
    }
    if (/ไม่เผ็ด/i.test(workingPhrase)) {
      modifiers.push({ groupName: 'ความเผ็ด', optionName: 'ไม่เผ็ด', price: 0 });
    }

    // D. Fuzzy / Substring Match with availableProducts
    const cleanedSearchName = workingPhrase.replace(/\s+/g, '').toLowerCase();

    let bestMatch: FixtureProduct | null = null;
    let highestScore = 0;

    for (const prod of availableProducts) {
      const pName = prod.name.replace(/\s+/g, '').toLowerCase();
      const pCode = (prod.menuCode || '').toLowerCase();
      let score = 0;

      // Exact code match (e.g. "n01", "b02")
      if (pCode && cleanedSearchName.includes(pCode)) {
        score += 80;
      }

      // Exact name match
      if (cleanedSearchName === pName) {
        score += 100;
      } else if (cleanedSearchName.includes(pName) || pName.includes(cleanedSearchName)) {
        score += 60;
      }

      // Common Keywords matching
      const keywords = [
        { word: 'ก๋วยเตี๋ยว', weight: 25 },
        { word: 'พะโล้', weight: 30 },
        { word: 'ตุ๋น', weight: 30 },
        { word: 'เห็ดหอม', weight: 30 },
        { word: 'บะหมี่', weight: 30 },
        { word: 'เป็ดย่าง', weight: 35 },
        { word: 'ข้าวหน้าเป็ด', weight: 40 },
        { word: 'ข้าว', weight: 20 },
        { word: 'ซุปเปอร์', weight: 40 },
        { word: 'หม้อไฟ', weight: 30 },
        { word: 'ชาดำ', weight: 40 },
        { word: 'เก๊กฮวย', weight: 40 },
        { word: 'เป็ด', weight: 15 },
        { word: 'น้ำ', weight: 10 },
      ];

      for (const kw of keywords) {
        if (cleanedSearchName.includes(kw.word) && pName.includes(kw.word)) {
          score += kw.weight;
        }
      }

      if (score > highestScore && score >= 25) {
        highestScore = score;
        bestMatch = prod;
      }
    }

    // Calculate final price per unit
    const modifierSum = modifiers.reduce((s, m) => s + m.price, 0);
    let unitPrice = bestMatch ? bestMatch.price + modifierSum : (explicitPrice ? explicitPrice : 0);

    // If explicit price is given for the whole phrase (e.g. "2 แก้ว 100 บาท" -> unitPrice = 50)
    if (explicitPrice && quantity > 1 && explicitPrice > unitPrice * 1.5) {
      unitPrice = Math.round(explicitPrice / quantity);
    }

    const itemName = bestMatch ? bestMatch.name : (workingPhrase || phrase);
    const confidence = bestMatch ? Math.min(1, highestScore / 100) : 0.4;

    if (bestMatch || explicitPrice || workingPhrase.length >= 2) {
      parsedItems.push({
        id: `parsed-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        matchedProduct: bestMatch,
        rawText: phrase,
        name: itemName,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        modifiers,
        notes: workingPhrase !== itemName ? workingPhrase : undefined,
        confidence,
      });
    } else {
      unmatched.push(phrase);
    }
  }

  const totalAmount = parsedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    tableNumber: detectedTable,
    items: parsedItems,
    unmatchedPhrases: unmatched,
    totalAmount,
  };
}
