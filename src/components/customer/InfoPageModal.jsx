import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X } from 'lucide-react';

const PAGES = {
  story: {
    title: 'Our story',
    content: (
      <>
        <p>
          zoriq was founded on a simple premise: everyday home and kitchen tools shouldn't be
          fragile, needlessly complex, or disposable. We curate items built from durable
          borosilicate glass, high-grade stainless steel, and natural wood.
        </p>
        <p className="mt-3">
          Every piece is designed to simplify cooking, storing, and living. Thoughtfully made to
          last for years, not weeks.
        </p>
      </>
    ),
  },
  about: {
    title: 'About zoriq',
    content: (
      <>
        <p>
          We are a modern lifestyle store based in India, bringing together kitchenware and home
          essentials that blend functional minimalism with enduring craftsmanship.
        </p>
        <p className="mt-3">
          Our products undergo strict food-safe certification, thermal shock testing, and leak-proof
          checks before arriving at your doorstep.
        </p>
      </>
    ),
  },
  contact: {
    title: 'Contact us',
    content: (
      <>
        <p>We are always happy to hear from you. Whether you have questions about an order or a product, reach out directly:</p>
        <div className="mt-4 space-y-2 text-sm text-[var(--ink2)]">
          <p><b>Email:</b> support@zoriq.in</p>
          <p><b>WhatsApp:</b> +91 98765 43210</p>
          <p><b>Hours:</b> Monday – Saturday, 9:00 AM – 7:00 PM IST</p>
        </div>
      </>
    ),
  },
  shipping: {
    title: 'Shipping & Delivery',
    content: (
      <>
        <p>
          We provide fast, reliable shipping across all serviceable postal codes in India.
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-sm text-[var(--ink2)]">
          <li>Standard shipping takes 5–9 business days.</li>
          <li>Free delivery on all orders above ₹599.</li>
          <li>Flat ₹40 delivery fee for orders below ₹599.</li>
          <li>Real-time SMS and tracking links provided immediately after dispatch.</li>
        </ul>
      </>
    ),
  },
  returns: {
    title: 'Returns & Replacements',
    content: (
      <>
        <p>
          We stand by the quality of our goods. If any glassware or steelware arrives broken,
          damaged, or defective:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside text-sm text-[var(--ink2)]">
          <li>7-day hassle-free replacement guarantee.</li>
          <li>Simply send an unboxing photo or video to our WhatsApp support.</li>
          <li>We will dispatch a brand-new replacement at zero extra cost.</li>
        </ul>
      </>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <>
        <p>
          Your privacy matters deeply to us. We never sell or share your personal contact information
          with third-party advertisers.
        </p>
        <p className="mt-3">
          Payments are securely encrypted through RBI-compliant payment gateways including
          Razorpay and Cash on Delivery.
        </p>
      </>
    ),
  },
  journal: {
    title: 'Journal & Care Guides',
    content: (
      <>
        <p>
          Tips and guides for maintaining your kitchenware:
        </p>
        <div className="mt-3 space-y-3 text-sm text-[var(--ink2)]">
          <div>
            <b>Borosilicate Glass:</b> Safe for microwaves, ovens, and dishwashers. Avoid sudden
            extreme temperature shocks.
          </div>
          <div>
            <b>Stainless Steel:</b> Wash with soft sponge and mild soap. Air dry thoroughly to keep
            the specular brushed finish pristine.
          </div>
        </div>
      </>
    ),
  },
};

export default function InfoPageModal() {
  const { activeInfoPage, setActiveInfoPage } = useStore();

  if (!activeInfoPage || !PAGES[activeInfoPage]) return null;

  const page = PAGES[activeInfoPage];

  return (
    <>
      <div
        className="scrim on"
        style={{ zIndex: 95 }}
        onClick={() => setActiveInfoPage(null)}
      ></div>

      <div className="sheet qvs on" role="dialog" aria-label={page.title}>
        <div className="grab"></div>
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <h3 className="text-2xl font-normal font-tenor text-[var(--ink)]">{page.title}</h3>
          <button
            type="button"
            className="close"
            aria-label="Close page"
            onClick={() => setActiveInfoPage(null)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="py-4 text-[15px] leading-relaxed text-[var(--ink2)]">
          {page.content}
        </div>
      </div>
    </>
  );
}
