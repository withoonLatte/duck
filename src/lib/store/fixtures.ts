export interface FixtureProduct {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  price: number;
  costPrice: number;
  sku: string;
  station: string;
  imageUrl: string;
  modifierGroupIds?: string[];
  customModifiers?: FixtureModifierGroup[];
}

export interface FixtureModifierGroup {
  id: string;
  name: string;
  required: boolean;
  min: number;
  max: number;
  options: { id: string; name: string; price: number; isDefault?: boolean }[];
}

export interface FixtureTable {
  id: string;
  number: string;
  name: string;
  capacity: number;
  floor: string;
}

export interface FixtureIngredient {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPerUnit: number;
}

export interface FixtureRecipe {
  productId: string;
  productName: string;
  items: { ingredientId: string; ingredientName: string; quantity: number; unit: string }[];
}

export const FIXTURE_RESTAURANT = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'ร้านก๋วยเตี๋ยวเป็ดนายเอก (Duck Noodle OS Demo)',
  branchName: 'สาขา 1 บรรทัดทอง (Main Branch)',
  taxId: '0105562001234',
  phone: '081-234-5678',
  address: '123 ถนนบรรทัดทอง แขวงวังใหม่ เขตปทุมวัน กรุงเทพมหานคร 10330',
};

export const FIXTURE_TABLES: FixtureTable[] = [
  { id: 't-01', number: 'T01', name: 'โต๊ะ 1 (หน้าร้าน)', capacity: 4, floor: '1' },
  { id: 't-02', number: 'T02', name: 'โต๊ะ 2 (หน้าร้าน)', capacity: 4, floor: '1' },
  { id: 't-03', number: 'T03', name: 'โต๊ะ 3 (กลางร้าน)', capacity: 4, floor: '1' },
  { id: 't-04', number: 'T04', name: 'โต๊ะ 4 (กลางร้าน)', capacity: 4, floor: '1' },
  { id: 't-05', number: 'T05', name: 'โต๊ะ 5 (ห้องแอร์)', capacity: 6, floor: '1' },
  { id: 't-06', number: 'T06', name: 'โต๊ะ 6 (ห้องแอร์)', capacity: 6, floor: '1' },
  { id: 't-07', number: 'T07', name: 'T07 (VIP ชั้น 2)', capacity: 8, floor: '2' },
  { id: 't-08', number: 'T08', name: 'T08 (VIP ชั้น 2)', capacity: 8, floor: '2' },
];

export const FIXTURE_CATEGORIES = [
  { id: 'cat-01', name: 'ก๋วยเตี๋ยว & บะหมี่เป็ด' },
  { id: 'cat-02', name: 'ข้าว & จานเดียว' },
  { id: 'cat-03', name: 'เป็ดจานเดี่ยว & ต้มซุป' },
  { id: 'cat-04', name: 'เครื่องดื่มสมุนไพร & น้ำ' },
];

export const FIXTURE_PRODUCTS: FixtureProduct[] = [
  {
    id: 'p-01',
    name: 'ก๋วยเตี๋ยวเป็ดพะโล้',
    category: 'ก๋วยเตี๋ยว & บะหมี่เป็ด',
    categoryId: 'cat-01',
    description: 'เนื้อเป็ดนุ่ม ชุ่มน้ำพะโล้หอมเครื่องเทศยาจีน เลือกเส้นได้ตามชอบ',
    price: 65,
    costPrice: 26,
    sku: 'DUCK-NDL-01',
    station: 'NOODLE_STATION',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p-02',
    name: 'บะหมี่หยกเป็ดย่างฮ่องกง',
    category: 'ก๋วยเตี๋ยว & บะหมี่เป็ด',
    categoryId: 'cat-01',
    description: 'บะหมี่หยกเหนียวนุ่ม เป็ดย่างหนังกรอบ ราดซอสหวานกลมกล่อมสูตรฮ่องกง',
    price: 80,
    costPrice: 32,
    sku: 'DUCK-NDL-02',
    station: 'NOODLE_STATION',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p-03',
    name: 'ก๋วยเตี๋ยวเป็ดตุ๋นเห็ดหอม',
    category: 'ก๋วยเตี๋ยว & บะหมี่เป็ด',
    categoryId: 'cat-01',
    description: 'เป็ดตุ๋นเปื่อยละลายในปาก เห็ดหอมคัดพิเศษ น้ำซุปหอมกลมกล่อม',
    price: 85,
    costPrice: 35,
    sku: 'DUCK-NDL-03',
    station: 'NOODLE_STATION',
    imageUrl: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p-04',
    name: 'ข้าวหน้าเป็ดย่างโบราณ',
    category: 'ข้าว & จานเดียว',
    categoryId: 'cat-02',
    description: 'ข้าวหอมมะลิร้อนๆ โปะเป็ดย่างพร้อมน้ำราดรสเด็ด แตงกวาและขิงดอง',
    price: 75,
    costPrice: 28,
    sku: 'DUCK-RICE-01',
    station: 'DUCK_STATION',
    imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p-05',
    name: 'เป็ดย่างจานใหญ่ (ครึ่งตัว)',
    category: 'เป็ดจานเดี่ยว & ต้มซุป',
    categoryId: 'cat-03',
    description: 'เป็ดย่างสูตรฮ่องกง หนังกรอบเนื้อนุ่ม เสิร์ฟพร้อมน้ำราดและพริกดองสูตรโบราณ',
    price: 280,
    costPrice: 110,
    sku: 'DUCK-DISH-01',
    station: 'DUCK_STATION',
    imageUrl: 'https://images.unsplash.com/photo-1514944298352-78d1a1b02846?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p-06',
    name: 'ต้มซุปเปอร์ปีกขาเป็ดหม้อไฟ',
    category: 'เป็ดจานเดี่ยว & ต้มซุป',
    categoryId: 'cat-03',
    description: 'รสแซ่บจัดจ้าน เปรี้ยว เผ็ด กลมกล่อม ปีกขาเป็ดเปื่อยนุ่ม หอมผักชีฝรั่ง',
    price: 150,
    costPrice: 50,
    sku: 'DUCK-SOUP-01',
    station: 'SOUP_STATION',
    imageUrl: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p-07',
    name: 'ชาดำเย็นโบราณ',
    category: 'เครื่องดื่มสมุนไพร & น้ำ',
    categoryId: 'cat-04',
    description: 'ชาไทยหอมเข้มข้น หวานชื่นใจ ชงสดใหม่ทุกวัน',
    price: 25,
    costPrice: 6,
    sku: 'BEV-01',
    station: 'BAR_STATION',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p-08',
    name: 'น้ำเก๊กฮวยดอกแท้',
    category: 'เครื่องดื่มสมุนไพร & น้ำ',
    categoryId: 'cat-04',
    description: 'เก๊กฮวยต้มสดจากดอกเก๊กฮวยแท้ หวานน้อย ชุ่มคอ แก้ร้อนใน',
    price: 25,
    costPrice: 6,
    sku: 'BEV-02',
    station: 'BAR_STATION',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  },
];

export const FIXTURE_MODIFIERS: FixtureModifierGroup[] = [
  {
    id: 'mod-01',
    name: 'เลือกชนิดเส้น',
    required: true,
    min: 1,
    max: 1,
    options: [
      { id: 'opt-01', name: 'เส้นเล็ก', price: 0, isDefault: true },
      { id: 'opt-02', name: 'เส้นใหญ่', price: 0 },
      { id: 'opt-03', name: 'บะหมี่ไข่เหลือง', price: 0 },
      { id: 'opt-04', name: 'บะหมี่หยก', price: 5 },
      { id: 'opt-05', name: 'เส้นหมี่ขาว', price: 0 },
      { id: 'opt-06', name: 'เกาเหลา (ไม่ใส่เส้น)', price: 0 },
    ],
  },
  {
    id: 'mod-02',
    name: 'ระดับความพิเศษ',
    required: false,
    min: 0,
    max: 1,
    options: [
      { id: 'opt-11', name: 'ธรรมดา', price: 0, isDefault: true },
      { id: 'opt-12', name: 'พิเศษ (+15฿)', price: 15 },
      { id: 'opt-13', name: 'จัมโบ้ (+30฿)', price: 30 },
    ],
  },
  {
    id: 'mod-03',
    name: 'ระดับความเผ็ด',
    required: false,
    min: 0,
    max: 1,
    options: [
      { id: 'opt-21', name: 'ไม่เผ็ด (ไม่ใส่พริก)', price: 0 },
      { id: 'opt-22', name: 'เผ็ดน้อย', price: 0 },
      { id: 'opt-23', name: 'เผ็ดปกติ', price: 0, isDefault: true },
      { id: 'opt-24', name: 'เผ็ดมาก (พริกคั่วพิเศษ)', price: 0 },
    ],
  },
  {
    id: 'mod-04',
    name: 'เพิ่มเครื่อง / ท็อปปิ้ง',
    required: false,
    min: 0,
    max: 4,
    options: [
      { id: 'opt-31', name: 'เพิ่มเนื้อเป็ดพะโล้ (+25฿)', price: 25 },
      { id: 'opt-32', name: 'เพิ่มเลือดเป็ดนุ่ม (+10฿)', price: 10 },
      { id: 'opt-33', name: 'เพิ่มไข่ต้มยางมะตูม (+10฿)', price: 10 },
      { id: 'opt-34', name: 'เพิ่มไส้แก้วกรุบกรอบ (+25฿)', price: 25 },
    ],
  },
  {
    id: 'mod-05',
    name: 'ระดับความหวาน & น้ำแข็ง',
    required: false,
    min: 0,
    max: 1,
    options: [
      { id: 'opt-41', name: 'หวานปกติ (100%)', price: 0, isDefault: true },
      { id: 'opt-42', name: 'หวานน้อย (50%)', price: 0 },
      { id: 'opt-43', name: 'ไม่หวาน (0%)', price: 0 },
      { id: 'opt-44', name: 'น้ำแข็งน้อย', price: 0 },
      { id: 'opt-45', name: 'แยกน้ำแข็ง (+5฿)', price: 5 },
    ],
  },
];

export const FIXTURE_INGREDIENTS: FixtureIngredient[] = [
  { id: 'ing-01', name: 'เนื้อเป็ดสด / เป็ดพะโล้', unit: 'กก.', stock: 35.5, minStock: 10, costPerUnit: 180 },
  { id: 'ing-02', name: 'เป็ดย่างฮ่องกง', unit: 'ตัว', stock: 12, minStock: 3, costPerUnit: 220 },
  { id: 'ing-03', name: 'เส้นก๋วยเตี๋ยวสด (รวม)', unit: 'กก.', stock: 28.0, minStock: 8, costPerUnit: 40 },
  { id: 'ing-04', name: 'บะหมี่หยกสด', unit: 'กก.', stock: 15.0, minStock: 5, costPerUnit: 55 },
  { id: 'ing-05', name: 'น้ำซุปพะโล้สูตรเข้มข้น', unit: 'ลิตร', stock: 80.0, minStock: 20, costPerUnit: 15 },
  { id: 'ing-06', name: 'เลือดเป็ดต้มสุก', unit: 'ก้อน', stock: 45, minStock: 15, costPerUnit: 8 },
  { id: 'ing-07', name: 'ไข่ไก่ต้มยางมะตูม', unit: 'ฟอง', stock: 60, minStock: 20, costPerUnit: 6 },
  { id: 'ing-08', name: 'ผักบุ้ง & ถั่วงอกสด', unit: 'กก.', stock: 20.0, minStock: 5, costPerUnit: 25 },
  { id: 'ing-09', name: 'ใบชาไทยพรีเมียม', unit: 'กก.', stock: 5.0, minStock: 1, costPerUnit: 120 },
  { id: 'ing-10', name: 'ดอกเก๊กฮวยแห้งเกรดเอ', unit: 'กก.', stock: 4.0, minStock: 1, costPerUnit: 250 },
];

export const FIXTURE_RECIPES: FixtureRecipe[] = [
  {
    productId: 'p-01',
    productName: 'ก๋วยเตี๋ยวเป็ดพะโล้',
    items: [
      { ingredientId: 'ing-01', ingredientName: 'เนื้อเป็ดสด / เป็ดพะโล้', quantity: 0.08, unit: 'กก.' },
      { ingredientId: 'ing-03', ingredientName: 'เส้นก๋วยเตี๋ยวสด', quantity: 0.10, unit: 'กก.' },
      { ingredientId: 'ing-05', ingredientName: 'น้ำซุปพะโล้', quantity: 0.30, unit: 'ลิตร' },
      { ingredientId: 'ing-08', ingredientName: 'ผักบุ้ง & ถั่วงอก', quantity: 0.03, unit: 'กก.' },
    ],
  },
  {
    productId: 'p-02',
    productName: 'บะหมี่หยกเป็ดย่างฮ่องกง',
    items: [
      { ingredientId: 'ing-02', ingredientName: 'เป็ดย่างฮ่องกง', quantity: 0.10, unit: 'ตัว' },
      { ingredientId: 'ing-04', ingredientName: 'บะหมี่หยกสด', quantity: 0.10, unit: 'กก.' },
      { ingredientId: 'ing-08', ingredientName: 'ผักบุ้ง & ถั่วงอก', quantity: 0.03, unit: 'กก.' },
    ],
  },
];
