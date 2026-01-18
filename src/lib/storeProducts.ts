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
    title: 'Just Make Noise Artist Bundle',
    description: 'Everything you need to start creating: Just Make Noise PEF, Split Sheet with One Stop Agreement, and Pro Tools Intro Recording Template.',
    price: 30,
    paymentLink: 'https://connect.intuit.com/portal/app/CommerceNetwork/view/scs-v1-761be65a2d3c43dd83c5371d80ab2820e019c19fd9f149aa81ca413f463922a24c46be752bc74bb8bdb984540ca0228a?locale=EN_US',
    downloadFiles: [
      '/downloads/Split_Sheet_Modernnostalgia.club.pdf',
      '/downloads/Pro_Tools_Intro_Template_-_MNC.zip',
      // '/downloads/Just_Make_Noise_PEF.pdf' - Add when available
    ],
    isBundle: true,
  },
  {
    id: 'be-loud-bundle',
    title: 'Be Loud Producer Bundle',
    description: 'Complete producer starter kit: Be Loud PDF, Split Sheet with One Stop Agreement, and Pro Tools Intro Recording Template.',
    price: 30,
    paymentLink: 'https://connect.intuit.com/portal/app/CommerceNetwork/view/scs-v1-0eee0d1dec0142b9b3bc3261339b538f5b15982372454174a5276a2f1f04772e5974a864f6564316a9db0c73ded26c5e?locale=EN_US',
    downloadFiles: [
      '/downloads/Split_Sheet_Modernnostalgia.club.pdf',
      '/downloads/Pro_Tools_Intro_Template_-_MNC.zip',
      // '/downloads/Be_Loud.pdf' - Add when available
    ],
    isBundle: true,
  },
];
