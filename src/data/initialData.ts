import { Category, Brand, Product, StoreSettings, PriceUpdateLog } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'pumps-domestic',
    nameFarsi: 'پمپ خانگی و بشقابی',
    nameEnglish: 'Domestic & Peripheral Pumps',
    iconName: 'Droplets',
    isSparePart: false,
    description: 'انواع پمپ‌های آب خانگی، بشقابی، تک پروانه و دو پروانه برای منازل و ساختمان‌ها'
  },
  {
    id: 'pumps-jet',
    nameFarsi: 'پمپ جتی و خودمکید',
    nameEnglish: 'Jet & Self-Priming Pumps',
    iconName: 'Zap',
    isSparePart: false,
    description: 'پمپ‌های آب جتی با مکش بالا مناسب برای چاه‌های کم‌عمق و مکش از منبع'
  },
  {
    id: 'pumps-multistage',
    nameFarsi: 'پمپ طبقاتی (افقی و عمودی)',
    nameEnglish: 'Multistage Pumps',
    iconName: 'Layers',
    isSparePart: false,
    description: 'پمپ‌های طبقاتی صنعتی و ساختمانی با هد بالا جهت بوسترپمپ و سیستم‌های تصفیه'
  },
  {
    id: 'pumps-submersible',
    nameFarsi: 'پمپ کف‌کش و لجن‌کش',
    nameEnglish: 'Submersible & Sewage Pumps',
    iconName: 'Waves',
    isSparePart: false,
    description: 'انواع پمپ‌های غوطه‌ور کف‌کش استخری، چاهی و لجن‌کش صنعتی با خردکن و بدون خردکن'
  },
  {
    id: 'pumps-circulator',
    nameFarsi: 'پمپ سیرکولاتور و شوفاژ',
    nameEnglish: 'Circulator Pumps',
    iconName: 'RotateCw',
    isSparePart: false,
    description: 'پمپ‌های گردش آب گرم و سرد سیستم‌های گرمایشی، موتورخانه و شوفاژ'
  },
  {
    id: 'spare-impellers',
    nameFarsi: 'پروانه پمپ (برنجی، نوری، استیل)',
    nameEnglish: 'Pump Impellers',
    iconName: 'Disc',
    isSparePart: true,
    description: 'انواع پروانه‌های برنجی، باکالیت (نوری) و استیل انواع پمپ‌های بشقابی و جتی'
  },
  {
    id: 'spare-seals',
    nameFarsi: 'مکانیکال سیل و فیبر و فنر',
    nameEnglish: 'Mechanical Seals',
    iconName: 'CircleDot',
    isSparePart: true,
    description: 'سیل مکانیکی سایز ۱۲، ۱۴، ۱۶، ۱۸، ۲۰ با متریال کربن، سرامیک، سیلیکون و ویتون'
  },
  {
    id: 'spare-tanks',
    nameFarsi: 'منبع تحت فشار و تیوپ',
    nameEnglish: 'Pressure Vessels & Diaphragms',
    iconName: 'Cylinder',
    isSparePart: true,
    description: 'مخازن دیافراگمی ۲۴، ۵۰، ۸۰، ۱۰۰ لیتری و تیوپ‌های ایتالیایی سفا (SEFA) و زیلمت'
  },
  {
    id: 'spare-controllers',
    nameFarsi: 'ست‌کنترل و کلید اتوماتیک',
    nameEnglish: 'Pressure Switches & Controllers',
    iconName: 'Sliders',
    isSparePart: true,
    description: 'دستگاه ست‌کنترل، کلید مکانیکی دانفوس و مربع و پنج‌راهی و گیج مانومتر'
  },
  {
    id: 'spare-capacitors',
    nameFarsi: 'خازن کارکرد و استارت',
    nameEnglish: 'Run & Start Capacitors',
    iconName: 'BatteryCharging',
    isSparePart: true,
    description: 'خازن‌های ۱۰ الی ۵۰ میکروفاراد ضد انفجار روغنی مناسب پمپ آب'
  },
  {
    id: 'spare-bearings',
    nameFarsi: 'بلبرینگ و بوش',
    nameEnglish: 'Bearings & Bushings',
    iconName: 'Circle',
    isSparePart: true,
    description: 'بلبرینگ‌های دور بالا 6201, 6202, 6203, 6204, 6205 مارک SKF و NACHI'
  },
  {
    id: 'spare-diffusers-covers',
    nameFarsi: 'دیفیوزر، واسطه و کلگی پمپ',
    nameEnglish: 'Diffusers & Pump Casing Parts',
    iconName: 'Shield',
    isSparePart: true,
    description: 'دیفیوزر نوری جتی، واسطه چدنی، پوسته چدنی و درپوش عقب پمپ'
  }
];

export const INITIAL_BRANDS: Brand[] = [
  { id: 'pentax', nameFarsi: 'پنتاکس', nameEnglish: 'Pentax', country: 'ایتالیا / ایران' },
  { id: 'ebara', nameFarsi: 'ابارا', nameEnglish: 'Ebara', country: 'ژاپن / ایتالیا' },
  { id: 'lowara', nameFarsi: 'لوارا', nameEnglish: 'Lowara', country: 'ایتالیا' },
  { id: 'shimge', nameFarsi: 'سیمجه', nameEnglish: 'Shimge', country: 'چین' },
  { id: 'pumpiran', nameFarsi: 'پمپ ایران', nameEnglish: 'Pump Iran', country: 'ایران' },
  { id: 'electrogen', nameFarsi: 'الکتروژن', nameEnglish: 'Electrogen', country: 'ایران' },
  { id: 'dieselsaz', nameFarsi: 'دیزل ساز', nameEnglish: 'Diesel Saz', country: 'ایران' },
  { id: 'stream', nameFarsi: 'استریم', nameEnglish: 'Stream', country: 'چین' },
  { id: 'leo', nameFarsi: 'لیو', nameEnglish: 'LEO', country: 'چین' },
  { id: 'sefa', nameFarsi: 'سفا', nameEnglish: 'SEFA', country: 'ایتالیا' },
  { id: 'skf', nameFarsi: 'اس کی اف', nameEnglish: 'SKF', country: 'سوئد' },
  { id: 'generic', nameFarsi: 'متفرقه / وارداتی', nameEnglish: 'Generic / Import', country: 'بین‌المللی' },
];

export const INITIAL_SEO_SETTINGS = {
  metaTitle: 'خرید پمپ آب، لوازم یدکی پمپ، مخزن تحت فشار، تیوپ مخزن و خازن | پمپینو',
  metaDescription: 'مرجع تخصصی خرید آنلاین و استعلام قیمت پمپ آب خانگی و صنعتی، قطعات یدکی پمپ (سیل مکانیکی، پروانه برنجی، ست کنترل، کلید اتوماتیک)، مخازن تحت فشار، لاستیک و تیوپ مخزن، خازن پمپ آب با ارسال سریع سراسر ایران در پمپینو.',
  keywords: 'پمپ آب, لوازم یدکی پمپ آب, سیل مکانیکی, پروانه پمپ, مخزن تحت فشار, تیوپ مخزن, لاستیک مخزن تحت فشار, خازن پمپ, ست کنترل, پنتاکس, دیزل ساز, پمپ بشقابی, پمپ محیطی, قطعات یدکی پمپینو',
  mainBadge: 'مرجع تخصصی تامین تجهیزات و لوازم یدکی پمپ آب در ایران',
  mainHeading: 'راهنمای جامع خرید پمپ آب، لوازم یدکی، مخزن تحت فشار، تیوپ و خازن',
  mainSubheading: 'فروشگاه پمپینو (PUMPINO) بزرگترین مرکز پخش و استعلام قیمت روز قطعات یدکی انواع پمپ‌های خانگی و صنعتی (پنتاکس، دیزل ساز، ابارا، نوید موتور)، مخازن دیافراگمی تحت فشار، لاستیک و تیوپ ایتالیایی منبع آب، خازن‌های راه‌انداز، ست کنترل و فیبر و فنر در سراسر کشور می‌باشد.',
  articleTitle: 'چرا تهیه قطعات یدکی اصلی پمپ آب (پمپینو) اهمیت دارد؟',
  articleParagraph1: 'پمپ آب ساختمان و تجهیزات آبرسانی، به دلیل عملکرد مداوم تحت فشار هیدرولیکی، نیازمند قطعات یدکی باکیفیت و استاندارد هستند. استفاده از سیل مکانیکی ناغیراستاندارد یا پروانه غیربالانس موجب خرابی زودهنگام بلبرینگ‌ها و در نهایت سوختن سیم‌پیچی الکتروموتور خواهد شد.',
  articleParagraph2: 'در فروشگاه پمپینو، تمامی قطعات از جمله تیوپ مخازن تحت فشار (از برندهای معتبر سفا SEFA ایتالیا)، خازن‌های درجه یک روغنی، کلیدهای فشار مکانیکی و ست‌کنترل‌های هوشمند همراه با مشخصات فنی دقیق و کد قطعه استاندارد عرضه می‌گردند تا در سریع‌ترین زمان ممکن قابل تحویل به باربری باشند.',
  articleTags: ['#خرید_پمپ_آب', '#لوازم_یدکی_پمپ', '#تیوپ_مخزن_تحت_فشار', '#خازن_پمپ_آب', '#سیل_مکانیکی', '#پروانه_پنتاکس'],
  cards: [
    {
      id: 'card-1',
      title: 'لوازم یدکی پمپ آب',
      description: 'خرید و استعلام قیمت انواع سیل مکانیکی (مکانیکال سیل)، پروانه برنجی و نوریل، شفت استیل، دیفیوزر و واسطه پمپ پنتاکس PM45، CAM100، CM100 و برندهای ایرانی و خارجی.'
    },
    {
      id: 'card-2',
      title: 'مخزن تحت فشار و تیوپ مخزن',
      description: 'انواع مخزن دیافراگمی تحت فشار ۲۴، ۵۰، ۱۰۰ و ۵۰۰ لیتری به همراه لاستیک و تیوپ مخزن مارک SEFA ایتالیا و EPDM مقاوم در برابر افت فشار و پارگی.'
    },
    {
      id: 'card-3',
      title: 'خازن پمپ آب و ادوات برقی',
      description: 'انواع خازن راه‌انداز پمپ آب ۱۵، ۲۰، ۲۵، ۳۰، ۴۰ و ۶۰ میکروفاراد (خشک و روغنی ۴۵۰ ولت) استاندارد جهت افزایش راندمان و جلوگیری از سوختن سیم‌پیچی الکتروموتور.'
    },
    {
      id: 'card-4',
      title: 'ست کنترل و کلید اتوماتیک',
      description: 'فروش و تامین ست کنترل دیجیتال پمپ، کلید اتوماتیک مکانیکی (مربوط به مخازن تحت فشار)، درجه گیج فشار، پنج‌راهی برنجی و سوپاپ برنجی خودکار.'
    }
  ],
  faqItems: [
    {
      id: 'faq-1',
      question: 'علائم خرابی سیل مکانیکی (مکانیکال سیل) پمپ آب چیست؟',
      answer: 'نشتی آب از بین پوسته پمپ و الکتروموتور، افت فشار شدید، صدای ناهنجار بلبرینگ‌ها و کارکرد مداوم پمپ بدون پمپاژ آب از مهم‌ترین علائم خراب شدن مکانیکال سیل می‌باشد.'
    },
    {
      id: 'faq-2',
      question: 'چه زمانی باید تیوپ مخزن تحت فشار تعویض شود و بهترین مارک چیست؟',
      answer: 'اگر پمپ آب با هر بار باز کردن شیر بلافاصله روشن و خاموش می‌شود یا از والو بالای منبع آب خارج می‌شود، تیوپ پاره شده است. تیوپ‌های SEFA و SEFA EPDM ایتالیایی بهترین کیفیت را دارا هستند.'
    },
    {
      id: 'faq-3',
      question: 'ظرفیت خازن مناسب برای پمپ آب ۱ اسب جتی و بشقابی چقدر است؟',
      answer: 'معمولاً برای پمپ‌های ۱ اسب تک‌فاز (جتی CAM100 یا بشقابی CM100) از خازن ۲۰ میکروفاراد یا ۲۵ میکروفاراد ۴۵۰ ولت روغنی/خشک استفاده می‌شود.'
    },
    {
      id: 'faq-4',
      question: 'نحوه ثبت سفارش و دریافت پیش‌فاکتور رسمی در پمپینو چگونه است؟',
      answer: 'کافیست قطعات یا پمپ‌های مورد نیاز را به سبد پیش‌فاکتور اضافه کرده، با شماره همراه خود وارد شده و خروجی فاکتور A4، اکسل یا ارسال مستقیم در پیام‌رسان‌های بله، روبیکا و واتساپ دریافت کنید.'
    }
  ]
};

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'PUMPINO (پمپینو)',
  tagline: 'مرکز تخصصی پمپ آب، بوسترپمپ و کامل‌ترین بانک قطعات یدکی پمپینو',
  phoneNumber: '۰۲۱-۳۳۹۸۷۶۵۴',
  mobileNumber: '۰۹۱۲۳۴۵۶۷۸۹',
  address: 'تهران، خیابان سعدی جنوبی، کوچه بوشهری، پاساژ صنعت، پلاک ۲۴',
  telegramAdmin: '@Pumpino_Admin',
  whatsappNumber: '989123456789',
  currencyUnit: 'تومان',
  lastUpdatedDate: '۱۴۰۳/۰۵/۰۶ - ۱۱:۳۰',
  adminPin: '99001529',
  footerNotice: 'تمامی قطعات ارائه شده اصلی بوده و دارای ضمانت اصالت کالا می‌باشند. قیمت‌ها روزانه به‌روزرسانی می‌شوند.',
  bankName: 'بانک ملی ایران (شعبه سعدی جنوبی)',
  bankCardNumber: '۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸',
  bankAccountNumber: '۰۱۲۳۴۵۶۷۸۹۰۰۱',
  bankIbanNumber: 'IR120170000000123456789001',
  bankOwnerName: 'فروشگاه پمپینو (PUMPINO)',
  seoSettings: INITIAL_SEO_SETTINGS,
  printerSettings: {
    autoPrintEnabled: true,
    soundAlertEnabled: true,
    printers: [
      {
        id: 'printer-default-1',
        name: 'چاپگر حرارتی صدور فاکتور (۸۰ میلی‌متری)',
        type: 'thermal_80mm',
        connectionType: 'browser_print',
        isDefault: true,
        autoPrintNewOrders: true,
        copies: 1,
        printHeader: 'فروشگاه پمپینو - فاکتور نهایی سفارش مشتری',
        printFooter: 'با تشکر از اعتماد شما به بازرگانی صنعت آبرسان پمپینو',
        enabled: true
      },
      {
        id: 'printer-default-2',
        name: 'چاپگر دفتر و انبار (A4 / A5)',
        type: 'a4_invoice',
        connectionType: 'browser_print',
        isDefault: false,
        autoPrintNewOrders: false,
        copies: 1,
        printHeader: 'بازرگانی صنعت آبرسان پمپینو',
        printFooter: 'تلفن تماس: ۰۲۱-۳۳۹۸۷۶۵۴ | آدرس: تهران، سعدی جنوبی',
        enabled: true
      }
    ]
  },
  paymentSettings: {
    onlineGatewaysEnabled: true,
    cardToCardEnabled: true,
    gateways: [
      {
        id: 'gw-zarinpal-1',
        name: 'درگاه پرداخت اینترنتی زرین‌پال (ZarinPal)',
        code: 'zarinpal',
        merchantId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        enabled: true,
        isDefault: true,
        description: 'پرداخت امن با کلیه کارت‌های شتاب'
      },
      {
        id: 'gw-idpay-2',
        name: 'درگاه پرداخت آیدی‌پی (IDPay)',
        code: 'idpay',
        merchantId: 'idpay_merchant_1001',
        enabled: true,
        isDefault: false,
        description: 'درگاه واسط پرداخت آنلاین شاپرک'
      },
      {
        id: 'gw-mellat-3',
        name: 'درگاه اختصاصی بانک ملت (به پرداخت)',
        code: 'mellat',
        merchantId: '1234567',
        terminalId: '7654321',
        enabled: false,
        isDefault: false,
        description: 'درگاه مستقیم بانک ملت'
      }
    ]
  }
};

export const INITIAL_PRICE_LOGS: PriceUpdateLog[] = [
  {
    id: 'log-101',
    date: '۱۴۰۳/۰۵/۰۶ - ۰۹:۳۰',
    productId: 'p-101',
    productTitle: 'پمپ آب محیطی نیم اسب پنتاکس',
    oldPrice: 4500000,
    newPrice: 4250000,
    updatedBy: 'مدیریت فروشگاه'
  },
  {
    id: 'log-102',
    date: '۱۴۰۳/۰۵/۰۶ - ۰۹:۳۰',
    productId: 'p-102',
    productTitle: 'پمپ آب جتی یک اسب پنتاکس اصلی',
    oldPrice: 8200000,
    newPrice: 7850000,
    updatedBy: 'مدیریت فروشگاه'
  },
  {
    id: 'log-401',
    date: '۱۴۰۳/۰۵/۰۵ - ۱۶:۴۵',
    productId: 'sp-401',
    productTitle: 'ست کنترل اتوماتیک پنتاکس اصلی مدل هیدروپاس',
    oldPrice: 2300000,
    newPrice: 2150000,
    updatedBy: 'مدیریت فروشگاه'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. PUMPS
  {
    id: 'p-101',
    sku: 'PUMP-PM45-PNT',
    titleFarsi: 'پمپ آب محیطی نیم اسب پنتاکس',
    model: 'PM45 / PM 45',
    categoryId: 'pumps-domestic',
    brandId: 'pentax',
    priceToman: 4250000,
    oldPriceToman: 4500000,
    stockStatus: 'in_stock',
    quantityInStock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    specs: {
      powerHp: 0.5,
      powerKw: 0.37,
      voltage: '220V تک‌فاز',
      inletOutletSize: '1" x 1"',
      maxHeadMeters: 35,
      maxFlowLpm: 40,
      impellerMaterial: 'برنجی',
      bodyMaterial: 'چدن',
      sealSizeMm: 12
    },
    description: 'پمپ محیطی نیم اسب پنتاکس اصلی مناسب برای واحدهای تک واحدی و تقویت فشار آب ساختمان تا طبقه دوم.',
    updatedAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: 'p-102',
    sku: 'PUMP-CAM100-PNT',
    titleFarsi: 'پمپ آب جتی یک اسب پنتاکس اصلی',
    model: 'CAM100 / CAM 100',
    categoryId: 'pumps-jet',
    brandId: 'pentax',
    priceToman: 7850000,
    oldPriceToman: 8200000,
    stockStatus: 'in_stock',
    quantityInStock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    specs: {
      powerHp: 1,
      powerKw: 0.75,
      voltage: '220V تک‌فاز',
      inletOutletSize: '1" x 1"',
      maxHeadMeters: 47,
      maxFlowLpm: 60,
      impellerMaterial: 'نوری (باکالیت) / برنجی',
      bodyMaterial: 'چدن',
      sealSizeMm: 14
    },
    description: 'پمپ جتی پرقدرت پنتاکس CAM100 مناسب برای مکش از مخزن و انتقال آب به طبقات ۳ و ۴ ساختمان.',
    updatedAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: 'p-103',
    sku: 'PUMP-CM100-PNT',
    titleFarsi: 'پمپ آب بشقابی یک اسب پنتاکس',
    model: 'CM100 / CM 100',
    categoryId: 'pumps-domestic',
    brandId: 'pentax',
    priceToman: 7400000,
    stockStatus: 'in_stock',
    quantityInStock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
    specs: {
      powerHp: 1,
      powerKw: 0.75,
      voltage: '220V تک‌فاز',
      inletOutletSize: '1" x 1"',
      maxHeadMeters: 33,
      maxFlowLpm: 90,
      impellerMaterial: 'برنجی',
      bodyMaterial: 'چدن',
      sealSizeMm: 14
    },
    description: 'پمپ بشقابی پر حجم پنتاکس با صدای کارکرد بسیار کم، مناسب آپارتمان تا ۳ طبقه.',
    updatedAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: 'p-104',
    sku: 'PUMP-CMA100-EBA',
    titleFarsi: 'پمپ بشقابی ۱ اسب ابارا ایتالیا',
    model: 'CMA 1.00 M',
    categoryId: 'pumps-domestic',
    brandId: 'ebara',
    priceToman: 8900000,
    stockStatus: 'in_stock',
    quantityInStock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    specs: {
      powerHp: 1,
      powerKw: 0.75,
      voltage: '220V تک‌فاز',
      inletOutletSize: '1" x 1"',
      maxHeadMeters: 35,
      maxFlowLpm: 95,
      impellerMaterial: 'برنجی',
      bodyMaterial: 'چدن',
      sealSizeMm: 14
    },
    description: 'پمپ بشقابی ابارا ایتالیا اصل با پروانه برنجی و کیفیت بدنه فوق‌العاده.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p-105',
    sku: 'PUMP-JET100-ELG',
    titleFarsi: 'پمپ جتی ۱ اسب الکتروژن',
    model: 'KPM100 / Jet100',
    categoryId: 'pumps-jet',
    brandId: 'electrogen',
    priceToman: 4950000,
    stockStatus: 'in_stock',
    quantityInStock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    specs: {
      powerHp: 1,
      powerKw: 0.75,
      voltage: '220V تک‌فاز',
      inletOutletSize: '1" x 1"',
      maxHeadMeters: 46,
      maxFlowLpm: 55,
      impellerMaterial: 'برنجی',
      bodyMaterial: 'چدن',
      sealSizeMm: 14
    },
    description: 'پمپ جتی ساخت ایران شرکت الکتروژن با سیم‌پیچ ۱۰۰٪ مس و ۱۸ ماه گارانتی شرکتی.',
    updatedAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: 'p-106',
    sku: 'PUMP-CB210-PNT',
    titleFarsi: 'پمپ آب دو پروانه دو اسب پنتاکس',
    model: 'CB210 / CB 210',
    categoryId: 'pumps-domestic',
    brandId: 'pentax',
    priceToman: 16500000,
    stockStatus: 'in_stock',
    quantityInStock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
    specs: {
      powerHp: 2,
      powerKw: 1.5,
      voltage: '220V تک‌فاز',
      inletOutletSize: '1.25" x 1"',
      maxHeadMeters: 57,
      maxFlowLpm: 140,
      impellerMaterial: 'برنجی (دو پروانه)',
      bodyMaterial: 'چدن',
      sealSizeMm: 18
    },
    description: 'پمپ دو پروانه ۲ اسب پنتاکس مناسب برای مجتمع‌های مسکونی تا ۶ طبقه و بوستر پمپ‌ها.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p-107',
    sku: 'PUMP-SUB2인-SHM',
    titleFarsi: 'پمپ کف‌کش ۲ اینچ ۱۶ متری سیمجه',
    model: 'QDX1.5-16-0.75F',
    categoryId: 'pumps-submersible',
    brandId: 'shimge',
    priceToman: 6300000,
    stockStatus: 'in_stock',
    quantityInStock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    specs: {
      powerHp: 1,
      powerKw: 0.75,
      voltage: '220V تک‌فاز',
      inletOutletSize: '2"',
      maxHeadMeters: 16,
      maxFlowLpm: 250,
      bodyMaterial: 'آلومینیوم / چدن'
    },
    description: 'کف‌کش فلوتردار سیمجه مناسب تخلیه استخر، چاه آب باران و مخازن کشاورزی.',
    updatedAt: new Date().toISOString()
  },

  // 2. SPARE PARTS - IMPELLERS
  {
    id: 'sp-201',
    sku: 'SP-IMP-CAM100-BRS',
    titleFarsi: 'پروانه برنجی پمپ جتی ۱ اسب (CAM100 / Jet100)',
    model: 'پروانه برنجی CAM100',
    categoryId: 'spare-impellers',
    brandId: 'pentax',
    priceToman: 480000,
    stockStatus: 'in_stock',
    quantityInStock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    specs: {
      impellerMaterial: 'برنج فوق فشرده (Brass)',
      shaftDiameterMm: 12,
      bodyMaterial: 'برنجی'
    },
    compatiblePumpModels: ['Pentax CAM100', 'Pentax CAM75', 'Electrogen Jet100', 'DieselSaz CAM100', 'Stream JET100'],
    description: 'پروانه برنجی تراش‌خورده و بالانس شده مخصوص پمپ‌های جتی ۱ اسب پنتاکس و طرح پنتاکس.',
    updatedAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: 'sp-202',
    sku: 'sp-IMP-CM100-BRS',
    titleFarsi: 'پروانه برنجی پمپ بشقابی ۱ اسب (CM100)',
    model: 'پروانه برنجی CM100',
    categoryId: 'spare-impellers',
    brandId: 'pentax',
    priceToman: 520000,
    stockStatus: 'in_stock',
    quantityInStock: 38,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    specs: {
      impellerMaterial: 'برنج (Brass)',
      shaftDiameterMm: 12
    },
    compatiblePumpModels: ['Pentax CM100', 'Ebara CMA100', 'Electrogen KPM100', 'DieselSaz CM100'],
    description: 'پروانه بشقابی اصلی با قطر خار استاندارد برای پمپ بشقابی ۱ اسب.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sp-203',
    sku: 'SP-IMP-PM45-BRS',
    titleFarsi: 'پروانه خورشیدی برنجی پمپ نیم اسب PM45',
    model: 'پروانه PM45 خورشیدی',
    categoryId: 'spare-impellers',
    brandId: 'pentax',
    priceToman: 280000,
    stockStatus: 'in_stock',
    quantityInStock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    specs: {
      impellerMaterial: 'برنج خورشیدی',
      shaftDiameterMm: 10
    },
    compatiblePumpModels: ['Pentax PM45', 'Stream PM45', 'Electrogen PM45', 'Shimge QB60'],
    description: 'پروانه خورشیدی دندانه دقیق مناسب پمپ‌های محیطی نیم اسب PM45 و QB60.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sp-204',
    sku: 'SP-IMP-CAM100-NOP',
    titleFarsi: 'پروانه نوری (باکالیت) پمپ جتی CAM100',
    model: 'پروانه باکالیت CAM100',
    categoryId: 'spare-impellers',
    brandId: 'pentax',
    priceToman: 220000,
    stockStatus: 'in_stock',
    quantityInStock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    specs: {
      impellerMaterial: 'نوری / باکالیت مقاوم در برابر حرارت (Noryl)',
      shaftDiameterMm: 12
    },
    compatiblePumpModels: ['Pentax CAM100', 'DieselSaz CAM100', 'LEO AJM75'],
    description: 'پروانه نوری فابریک ایتالیایی ضد زنگ و ضد رسوب مناسب آب‌های املاح‌دار.',
    updatedAt: new Date().toISOString()
  },

  // 3. SPARE PARTS - MECHANICAL SEALS
  {
    id: 'sp-301',
    sku: 'SP-SEAL-12MM',
    titleFarsi: 'مکانیکال سیل سایز ۱۲ (فیبر و فنر نیم اسب)',
    model: 'Seal 12mm Carbon/Ceramic',
    categoryId: 'spare-seals',
    brandId: 'generic',
    priceToman: 110000,
    stockStatus: 'in_stock',
    quantityInStock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    specs: {
      sealSizeMm: 12,
      bodyMaterial: 'کربن - سرامیک - NBR'
    },
    compatiblePumpModels: ['Pentax PM45', 'Pentax PM80', 'Stream PM45', 'Shimge QB60'],
    description: 'سیل مکانیکی سایز ۱۲ میلی‌متر استاندارد مناسب پمپ‌های نیم اسب و بشقابی کوچک.',
    updatedAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: 'sp-302',
    sku: 'SP-SEAL-14MM',
    titleFarsi: 'مکانیکال سیل سایز ۱۴ (فیبر و فنر ۱ اسب جتی و بشقابی)',
    model: 'Seal 14mm Standard',
    categoryId: 'spare-seals',
    brandId: 'generic',
    priceToman: 135000,
    stockStatus: 'in_stock',
    quantityInStock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    specs: {
      sealSizeMm: 14,
      bodyMaterial: 'کربن - سرامیک - فنر استیل'
    },
    compatiblePumpModels: ['Pentax CAM100', 'Pentax CM100', 'Ebara CMA100', 'Electrogen Jet100', 'DieselSaz CAM100'],
    description: 'مکانیکال سیل سایز ۱۴ پرمصرف‌ترین فیبر و فنر پمپ‌های ۱ اسب جتی و بشقابی در بازار.',
    updatedAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: 'sp-303',
    sku: 'SP-SEAL-18MM',
    titleFarsi: 'مکانیکال سیل سایز ۱۸ (فیبر و فنر ۲ و ۳ اسب)',
    model: 'Seal 18mm Heavy Duty',
    categoryId: 'spare-seals',
    brandId: 'generic',
    priceToman: 190000,
    stockStatus: 'in_stock',
    quantityInStock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    specs: {
      sealSizeMm: 18,
      bodyMaterial: 'کربن - سرامیک - فنر استیل 304'
    },
    compatiblePumpModels: ['Pentax CB210', 'Pentax CBT310', 'Ebara CDA200', 'Lowara CEA'],
    description: 'سیل مکانیکی سایز ۱۸ با مقاومت بالا مناسب پمپ‌های دو پروانه و ۲ اسب به بالا.',
    updatedAt: new Date().toISOString()
  },

  // 4. SPARE PARTS - CONTROLLERS & SWITCHES
  {
    id: 'sp-401',
    sku: 'SP-CTRL-PENTAX-HIDRO',
    titleFarsi: 'ست کنترل اتوماتیک پنتاکس اصلی مدل هیدروپاس (Hydropas)',
    model: 'Hydropas Pentax',
    categoryId: 'spare-controllers',
    brandId: 'pentax',
    priceToman: 2150000,
    oldPriceToman: 2300000,
    stockStatus: 'in_stock',
    quantityInStock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    specs: {
      pressureRangeBar: '1.5 - 10 bar',
      voltage: '220V تک‌فاز',
      inletOutletSize: '1" x 1"'
    },
    compatiblePumpModels: ['Pentax CAM100', 'Pentax CM100', 'Electrogen Jet100', 'همه پمپ‌های تک‌فاز تا ۲ اسب'],
    description: 'ست کنترل دیجیتال پنتاکس جهت قطع و وصل اتوماتیک پمپ بدون نیاز به منبع تحت فشار و کلید مکانیکی.',
    updatedAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: 'sp-402',
    sku: 'SP-CTRL-STREAM-PC13',
    titleFarsi: 'ست کنترل استریم مدل PC-13 با درجه مانومتر',
    model: 'PC-13 Stream',
    categoryId: 'spare-controllers',
    brandId: 'stream',
    priceToman: 980000,
    stockStatus: 'in_stock',
    quantityInStock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    specs: {
      pressureRangeBar: '1.5 - 3 bar',
      voltage: '220V تک‌فاز',
      inletOutletSize: '1" x 1"'
    },
    compatiblePumpModels: ['تمامی پمپ‌های خانگی نیم اسب تا ۱.۵ اسب'],
    description: 'ست کنترل پرفروش استریم با کیت الکترونیکی تقویت‌شده و گیج مانومتر نشان‌دهنده فشار.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sp-403',
    sku: 'SP-SWITCH-SQUARE-D',
    titleFarsi: 'کلید اتوماتیک مکانیکی اسکوئردی (Square D) مکزیک',
    model: 'FSG-2 Square D',
    categoryId: 'spare-controllers',
    brandId: 'generic',
    priceToman: 1450000,
    stockStatus: 'in_stock',
    quantityInStock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    specs: {
      pressureRangeBar: '1.4 - 4.6 bar',
      voltage: '220V تک‌فاز'
    },
    compatiblePumpModels: ['سیستم‌های منبع تحت فشار ۲۴ الی ۱۰۰ لیتر'],
    description: 'کلید اتوماتیک مکانیکی پمپ آب مارک اسکوئردی اصلی فوق‌العاده با دوام.',
    updatedAt: new Date().toISOString()
  },

  // 5. SPARE PARTS - TANKS & DIAPHRAGMS
  {
    id: 'sp-501',
    sku: 'SP-TANK-24L-SEFA',
    titleFarsi: 'منبع تحت فشار ۲۴ لیتری سفا ایتالیا (SEFA)',
    model: 'SEFA 24 Liters',
    categoryId: 'spare-tanks',
    brandId: 'sefa',
    priceToman: 1850000,
    stockStatus: 'in_stock',
    quantityInStock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
    specs: {
      tankCapacityLiters: 24,
      pressureRangeBar: '10 bar max',
      inletOutletSize: '1"'
    },
    compatiblePumpModels: ['پمپ‌های ۱ اسب جتی و بشقابی خانگی'],
    description: 'منبع دیافراگمی ۲۴ لیتری سفا ایتالیا همراه با تیوپ EPDM بهداشتی فابریک.',
    updatedAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: 'sp-502',
    sku: 'SP-TUBE-24L-SEFA',
    titleFarsi: 'تیوپ منبع تحت فشار ۲۴ لیتری سفا ایتالیا (SEFA EPDM)',
    model: 'Tube 24L SEFA EPDM',
    categoryId: 'spare-tanks',
    brandId: 'sefa',
    priceToman: 650000,
    stockStatus: 'in_stock',
    quantityInStock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
    specs: {
      tankCapacityLiters: 24,
      bodyMaterial: 'EPDM بهداشتی درجه یک'
    },
    compatiblePumpModels: ['منابع ۲۴ لیتری سفا، زیلمت، امبرا و منابع ایرانی استاندارد'],
    description: 'تیوپ اصلی سفا ایتالیا مناسب برای آب شرب و بدون بو گرفتن آب.',
    updatedAt: new Date().toISOString()
  },

  // 6. SPARE PARTS - CAPACITORS & BEARINGS
  {
    id: 'sp-601',
    sku: 'SP-CAP-20UF',
    titleFarsi: 'خازن روغنی ۲۰ میکروفاراد ۴۵۰ ولت (مناسب پمپ ۱ اسب)',
    model: 'Capacitor 20uF 450V',
    categoryId: 'spare-capacitors',
    brandId: 'generic',
    priceToman: 125000,
    stockStatus: 'in_stock',
    quantityInStock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    specs: {
      capacitorVal: '20 uF',
      voltage: '450V'
    },
    compatiblePumpModels: ['Pentax CAM100', 'Pentax CM100', 'Electrogen Jet100', 'DieselSaz CAM100'],
    description: 'خازن روغنی ضد انفجار سیم‌دار مناسب راه‌اندازی و کارکرد پمپ‌های ۱ اسب تک‌فاز.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sp-602',
    sku: 'SP-CAP-12.5UF',
    titleFarsi: 'خازن ۱۲.۵ میکروفاراد ۴۵0 ولت (پمپ نیم اسب PM45)',
    model: 'Capacitor 12.5uF 450V',
    categoryId: 'spare-capacitors',
    brandId: 'generic',
    priceToman: 95000,
    stockStatus: 'in_stock',
    quantityInStock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    specs: {
      capacitorVal: '12.5 uF',
      voltage: '450V'
    },
    compatiblePumpModels: ['Pentax PM45', 'Stream PM45', 'Shimge QB60'],
    description: 'خازن راه‌انداز خازنی پمپ‌های محیطی نیم اسب.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sp-603',
    sku: 'SP-BRG-6202-SKF',
    titleFarsi: 'بلبرینگ دور بالا 6202 SKF اصلی (2Z C3)',
    model: 'Bearing 6202 2Z C3 SKF',
    categoryId: 'spare-bearings',
    brandId: 'skf',
    priceToman: 180000,
    stockStatus: 'in_stock',
    quantityInStock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    specs: {
      bearingCode: '6202 2Z'
    },
    compatiblePumpModels: ['Pentax CAM100', 'Pentax CM100', 'اکثر پمپ‌های ۱ اسب'],
    description: 'بلبرینگ دور بالا 6202 مارک اس کی اف با گریس نسوز مخصوص دینام پمپ آب.',
    updatedAt: new Date().toISOString()
  },

  // 7. DIFFUSERS & CASING
  {
    id: 'sp-701',
    sku: 'SP-DFF-CAM100',
    titleFarsi: 'دیفیوزر و شیپوری پمپ جتی ۱ اسب (CAM100)',
    model: 'Diffuser Set CAM100',
    categoryId: 'spare-diffusers-covers',
    brandId: 'pentax',
    priceToman: 340000,
    stockStatus: 'in_stock',
    quantityInStock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    specs: {
      bodyMaterial: 'نوری (باکالیت فشرده)'
    },
    compatiblePumpModels: ['Pentax CAM100', 'Electrogen Jet100', 'DieselSaz CAM100', 'Stream JET100'],
    description: 'مجموعه کامل دیفیوزر نوری و نازل شیپوری داخل کلگی پمپ‌های جتی ۱ اسب.',
    updatedAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: 'sp-702',
    sku: 'SP-5WAY-BRASS',
    titleFarsi: 'پنج‌راهی برنجی پمپ آب (رابط مانومتر و کلید)',
    model: '5-Way Brass Connector',
    categoryId: 'spare-diffusers-covers',
    brandId: 'generic',
    priceToman: 220000,
    stockStatus: 'in_stock',
    quantityInStock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    specs: {
      bodyMaterial: 'برنج فورج سنگین',
      inletOutletSize: '1"'
    },
    compatiblePumpModels: ['تمامی پمپ‌های خانگی دارای کلید اتوماتیک و منبع تحت فشار'],
    description: 'پنج‌راهی برنجی سنگین رزوه دقیق جهت اتصال پمپ، منبع، کلید اتوماتیک و گیج فشار.',
    updatedAt: new Date().toISOString()
  }
];
