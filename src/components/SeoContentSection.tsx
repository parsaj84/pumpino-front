import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, Wrench, Layers, Zap, Gauge, CheckCircle2, HelpCircle } from 'lucide-react';
import { StoreSettings } from '../types';
import { INITIAL_SEO_SETTINGS } from '../data/initialData';

interface SeoContentSectionProps {
  storeSettings?: StoreSettings;
}

export const SeoContentSection: React.FC<SeoContentSectionProps> = ({ storeSettings }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const seo = storeSettings?.seoSettings || INITIAL_SEO_SETTINGS;

  useEffect(() => {
    if (seo.metaTitle) {
      document.title = seo.metaTitle;
    }
    if (seo.metaDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', seo.metaDescription);
    }
    if (seo.keywords) {
      let metaKw = document.querySelector('meta[name="keywords"]');
      if (!metaKw) {
        metaKw = document.createElement('meta');
        metaKw.setAttribute('name', 'keywords');
        document.head.appendChild(metaKw);
      }
      metaKw.setAttribute('content', seo.keywords);
    }
  }, [seo.metaTitle, seo.metaDescription, seo.keywords]);

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => (prev === idx ? null : idx));
  };

  const faqList = seo.faqItems && seo.faqItems.length > 0 ? seo.faqItems : INITIAL_SEO_SETTINGS.faqItems;
  const cardsList = seo.cards && seo.cards.length > 0 ? seo.cards : INITIAL_SEO_SETTINGS.cards;
  const tagsList = seo.articleTags && seo.articleTags.length > 0 ? seo.articleTags : INITIAL_SEO_SETTINGS.articleTags;

  // Icons array mapping for 4 cards
  const cardIcons = [
    <Wrench key="1" className="w-5 h-5" />,
    <Layers key="2" className="w-5 h-5" />,
    <Zap key="3" className="w-5 h-5" />,
    <Gauge key="4" className="w-5 h-5" />
  ];

  const cardIconColors = [
    'bg-sky-100 text-sky-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700'
  ];

  // Structured Data JSON-LD for Google Rich Snippets & FAQ Schema
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://pumpino.ir/#website",
        "url": "https://pumpino.ir",
        "name": storeSettings?.storeName || "پمپینو | بانک جامع پمپ آب و قطعات یدکی",
        "description": seo.metaDescription || "فروشگاه تخصصی و مرجع استعلام قیمت انواع پمپ آب، لوازم یدکی پمپ، مخازن تحت فشار، لاستیک و تیوپ مخزن، خازن و کلید اتوماتیک",
        "inLanguage": "fa-IR",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://pumpino.ir/?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Store",
        "@id": "https://pumpino.ir/#store",
        "name": storeSettings?.storeName || "فروشگاه و مرجع قطعات پمپ آب پمپینو (PUMPINO)",
        "image": "https://pumpino.ir/logo.png",
        "telephone": storeSettings?.phoneNumber || "+982133990000",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": storeSettings?.address || "خیابان سعدی جنوبی، کوچه بوشهری، پاساژ نیرو",
          "addressLocality": "تهران",
          "addressCountry": "IR"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqList.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      }
    ]
  };

  return (
    <section className="mt-12 bg-white border-t border-slate-200 py-10 print:hidden shadow-xs">
      {/* Script Tag for Google Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Main SEO Header Tag (H2 / H1 Level for Google Crawler Indexing) */}
        <div className="border-b border-slate-100 pb-6 text-center md:text-right">
          <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-800 px-3 py-1 rounded-full text-xs font-bold border border-sky-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>{seo.mainBadge || INITIAL_SEO_SETTINGS.mainBadge}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {seo.mainHeading || INITIAL_SEO_SETTINGS.mainHeading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-4xl">
            {seo.mainSubheading || INITIAL_SEO_SETTINGS.mainSubheading}
          </p>
        </div>

        {/* SEO Knowledge Cards for Google Keyword Indexing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardsList.map((card, idx) => (
            <article key={card.id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-sky-300 transition space-y-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${cardIconColors[idx % cardIconColors.length]}`}>
                {cardIcons[idx % cardIcons.length]}
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {card.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {card.description}
              </p>
            </article>
          ))}
        </div>

        {/* Deep Keyword Article Section for Google Rich Indexing */}
        <article className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>نکات کلیدی قبل از خرید و تعویض لوازم یدکی پمپ آب</span>
          </div>

          <h3 className="text-lg md:text-xl font-black text-slate-100">
            {seo.articleTitle || INITIAL_SEO_SETTINGS.articleTitle}
          </h3>

          <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-3 font-light">
            <p>{seo.articleParagraph1 || INITIAL_SEO_SETTINGS.articleParagraph1}</p>
            <p>{seo.articleParagraph2 || INITIAL_SEO_SETTINGS.articleParagraph2}</p>
          </div>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
            {tagsList.map((tag, idx) => (
              <span key={idx} className="bg-slate-800/80 text-sky-300 px-3 py-1 rounded-xl border border-slate-700">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </article>

        {/* Google FAQ Accordion Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-slate-900 font-black text-base sm:text-lg">
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <h3>سوالات متداول خریداران پمپ و لوازم یدکی (FAQ)</h3>
          </div>

          <div className="space-y-2">
            {faqList.map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-right p-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
