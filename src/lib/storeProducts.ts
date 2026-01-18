export interface StoreProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  paymentLink: string;
  downloadFiles: string[]; // Paths to downloadable files for members
  isBundle: boolean;
  externalLinks?: { label: string; url: string }[];
}

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'split-sheet',
    title: 'Split Sheet w/ One Stop Agreement',
    description: 'Professional split sheet template with a built-in one stop licensing agreement. Essential for any collaboration.',
    price: 10,
    paymentLink: 'https://connect.intuit.com/portal/app/CommerceNetwork/view/scs-v1-b65c94c94b844a3da43adaaae90c790c4b144f3ae59341bfa66667ccc1d34c7879b54d366c9f45e38d660c8c1376f34b?locale=EN_US',
    downloadFiles: ['/downloads/Split_Sheet_Modernnostalgia.club.pdf'],
    isBundle: false,
  },
  {
    id: 'pro-tools-template',
    title: 'Pro Tools Intro Recording Template',
    description: 'Ready-to-use recording template for Pro Tools Intro. Get started quickly with a professional session setup.',
    price: 10,
    paymentLink: 'https://connect.intuit.com/portal/app/CommerceNetwork/view/scs-v1-e3b25473aee84fff8231d2315a8c0a364cd2017a05bc4b5391935499235ac3b61b2a57b08b16478d9744811c8e9ed8e5?locale=EN_US',
    downloadFiles: ['/downloads/Pro_Tools_Intro_Template_-_MNC.zip'],
    isBundle: false,
    externalLinks: [
      { label: 'Download Pro Tools Intro (Free from Avid)', url: 'https://www.avid.com/pro-tools' }
    ],
  },
  {
    id: 'just-make-noise-bundle',
    title: 'Just Make Noise: 2026 Indie Artist Bundle',
    description: 'A clear, no-fluff guide for independent artists who want to stop guessing and start building a real music business. This eBook breaks down why streams fail, how direct-to-fan actually works, and how to treat songs like assets instead of lottery tickets. Built for artists who want clarity, ownership, and long-term income without waiting for permission. Includes free Split Sheet + Pro Tools Intro Template.',
    price: 30,
    paymentLink: 'https://connect.intuit.com/portal/app/CommerceNetwork/view/scs-v1-761be65a2d3c43dd83c5371d80ab2820e019c19fd9f149aa81ca413f463922a24c46be752bc74bb8bdb984540ca0228a?locale=EN_US',
    downloadFiles: [
      '/downloads/Just_Make_Noise_eBook.pdf',
      '/downloads/Split_Sheet_Modernnostalgia.club.pdf',
      '/downloads/Pro_Tools_Intro_Template_-_MNC.zip',
    ],
    isBundle: true,
  },
  {
    id: 'be-loud-bundle',
    title: 'Be Loud: How to Make a Living Making Beats',
    description: 'A practical blueprint for producers who want daily income from beats without racing to the bottom. Learn how to sell exclusives, create urgency, build proof, and prepare your catalog for sync licensing. This is about systems, not followers. Includes free Split Sheet + Pro Tools Intro Template.',
    price: 30,
    paymentLink: 'https://connect.intuit.com/portal/app/CommerceNetwork/view/scs-v1-0eee0d1dec0142b9b3bc3261339b538f5b15982372454174a5276a2f1f04772e5974a864f6564316a9db0c73ded26c5e?locale=EN_US',
    downloadFiles: [
      '/downloads/Be_Loud_eBook.pdf',
      '/downloads/Split_Sheet_Modernnostalgia.club.pdf',
      '/downloads/Pro_Tools_Intro_Template_-_MNC.zip',
    ],
    isBundle: true,
  },
];
