import { Product, Category, Brand, StoreSettings, PriceUpdateLog, CustomerProfile, CustomerOrder } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_STORE_SETTINGS, INITIAL_PRICE_LOGS } from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'water_pump_app_products_v1',
  CATEGORIES: 'water_pump_app_categories_v1',
  BRANDS: 'water_pump_app_brands_v1',
  STORE_SETTINGS: 'water_pump_app_store_v1',
  PRICE_LOGS: 'water_pump_app_price_logs_v1',
  CUSTOMER_PROFILE: 'water_pump_app_customer_profile_v1',
  CUSTOMER_ORDERS: 'water_pump_app_customer_orders_v1'
};

export function loadProducts(): Product[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading products from storage:', e);
  }
  saveProducts(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products:', e);
  }
}

export function loadCategories(): Category[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading categories:', e);
  }
  return INITIAL_CATEGORIES;
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories:', e);
  }
}

export function loadBrands(): Brand[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BRANDS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading brands:', e);
  }
  return INITIAL_BRANDS;
}

export function saveBrands(brands: Brand[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
  } catch (e) {
    console.error('Error saving brands:', e);
  }
}

export function loadStoreSettings(): StoreSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STORE_SETTINGS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading store settings:', e);
  }
  return INITIAL_STORE_SETTINGS;
}

export function saveStoreSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving store settings:', e);
  }
}

export function loadPriceLogs(): PriceUpdateLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICE_LOGS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading price logs:', e);
  }
  savePriceLogs(INITIAL_PRICE_LOGS);
  return INITIAL_PRICE_LOGS;
}

export function savePriceLogs(logs: PriceUpdateLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRICE_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving price logs:', e);
  }
}

export function loadCustomerProfile(): CustomerProfile | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_PROFILE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading customer profile:', e);
  }
  return null;
}

export function saveCustomerProfile(profile: CustomerProfile | null): void {
  try {
    if (profile) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_PROFILE, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER_PROFILE);
    }
  } catch (e) {
    console.error('Error saving customer profile:', e);
  }
}

export function loadCustomerOrders(): CustomerOrder[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDERS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading customer orders:', e);
  }
  // Return sample initial order if empty
  const sampleOrder: CustomerOrder = {
    id: 'ord-sample-1',
    orderNumber: 'ORD-1403-1001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerProfile: {
      id: 'cust-demo',
      fullName: 'علی محمدی',
      storeName: 'فروشگاه تاسیسات امین',
      mobilePhone: '09123456789',
      telephone: '02188884433',
      provinceCity: 'تهران / بازار بزرگ',
      address: 'خیابان خیام، پلاک ۱۲۴، فروشگاه امین',
      freightName: 'باربری جهانگیر (خیابان خیام)',
      createdAt: new Date().toISOString()
    },
    items: [
      {
        productId: 'p-1',
        sku: 'PM-CAM100',
        productTitle: 'پمپ آب جتی ۱ اسب پنتاکس CAM100',
        model: 'CAM 100/00',
        requestedQuantity: 2,
        approvedQuantity: 2,
        originalPriceToman: 6850000,
        approvedPriceToman: 6700000,
        discountPercent: 2
      },
      {
        productId: 'p-7',
        sku: 'SP-SEAL14',
        productTitle: 'مکانیکال سیل ۱۴ میلی‌متر پنتاکس',
        model: 'M32/14',
        requestedQuantity: 10,
        approvedQuantity: 10,
        originalPriceToman: 320000,
        approvedPriceToman: 300000,
        discountPercent: 6
      }
    ],
    status: 'approved',
    statusTitle: 'تایید شده و فاکتور صادر گردید',
    shippingFreightName: 'باربری جهانگیر (خیابان خیام)',
    adminNote: 'کاله‌ها آماده ارسال از انبار مرکزی به باربری جهانگیر جهت تحویل به مشتری.',
    totalAmountToman: 16400000,
    discountToman: 400000,
    invoiceIssuedDate: new Date().toLocaleDateString('fa-IR'),
    isInvoiceIssued: true
  };

  const initialOrders = [sampleOrder];
  saveCustomerOrders(initialOrders);
  return initialOrders;
}

export function saveCustomerOrders(orders: CustomerOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving customer orders:', e);
  }
}

export function resetToInitialData(): void {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.BRANDS);
  localStorage.removeItem(STORAGE_KEYS.STORE_SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.PRICE_LOGS);
}

export interface OnlineStorePayload {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  storeSettings: StoreSettings;
  priceLogs: PriceUpdateLog[];
  orders?: CustomerOrder[];
  lastUpdated?: string;
}

/**
 * Fetches live data from cPanel server (/api.php or /data.json)
 */
export async function fetchOnlineData(): Promise<OnlineStorePayload | null> {
  const timestamp = Date.now();
  const endpoints = [`/api.php?t=${timestamp}`, `/data.json?t=${timestamp}`];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          // Sync with localStorage
          saveProducts(data.products);
          if (Array.isArray(data.categories)) saveCategories(data.categories);
          if (Array.isArray(data.brands)) saveBrands(data.brands);
          if (data.storeSettings) saveStoreSettings(data.storeSettings);
          if (Array.isArray(data.priceLogs)) savePriceLogs(data.priceLogs);
          if (Array.isArray(data.orders)) saveCustomerOrders(data.orders);
          return data;
        }
      }
    } catch (err) {
      console.warn(`Could not fetch live data from ${url}:`, err);
    }
  }
  return null;
}

/**
 * Saves store data directly to cPanel server (/api.php)
 */
export async function saveOnlineData(payload: OnlineStorePayload): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: result.success ?? true,
        message: result.message || 'اطلاعات با موفقیت روی هاست cPanel ذخیره شد.'
      };
    } else {
      const errText = await response.text();
      return {
        success: false,
        message: `خطای سرور (${response.status}): ${errText || 'امکان ذخیره اطلاعات روی هاست وجود نداشت'}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'خطا در ارتباط با api.php هاست.'
    };
  }
}

