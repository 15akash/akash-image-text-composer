import { 
  Inter, 
  Roboto, 
  Open_Sans, 
  Lato, 
  Montserrat, 
  Oswald, 
  Source_Sans_3,
  Raleway,
  Poppins,
  Nunito,
  Playfair_Display,
  Merriweather,
  Roboto_Slab,
  Dancing_Script,
  Caveat,
  Pacifico,
  Lobster,
  Righteous,
  Bangers,
  Orbitron
} from 'next/font/google';

// Configure Google Fonts
const inter = Inter({ subsets: ['latin'], display: 'swap' });
const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '500', '700'], display: 'swap' });
const openSans = Open_Sans({ subsets: ['latin'], display: 'swap' });
const lato = Lato({ subsets: ['latin'], weight: ['300', '400', '700', '900'], display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' });
const oswald = Oswald({ subsets: ['latin'], display: 'swap' });
const sourceSans = Source_Sans_3({ subsets: ['latin'], display: 'swap' });
const raleway = Raleway({ subsets: ['latin'], display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['300', '400', '700', '900'], display: 'swap' });
const robotoSlab = Roboto_Slab({ subsets: ['latin'], display: 'swap' });
const dancingScript = Dancing_Script({ subsets: ['latin'], display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], display: 'swap' });
const pacifico = Pacifico({ subsets: ['latin'], weight: '400', display: 'swap' });
const lobster = Lobster({ subsets: ['latin'], weight: '400', display: 'swap' });
const righteous = Righteous({ subsets: ['latin'], weight: '400', display: 'swap' });
const bangers = Bangers({ subsets: ['latin'], weight: '400', display: 'swap' });
const orbitron = Orbitron({ subsets: ['latin'], display: 'swap' });

// Font definitions with CSS class names
export const GOOGLE_FONTS = {
  'Inter': inter,
  'Roboto': roboto,
  'Open Sans': openSans,
  'Lato': lato,
  'Montserrat': montserrat,
  'Oswald': oswald,
  'Source Sans 3': sourceSans,
  'Raleway': raleway,
  'Poppins': poppins,
  'Nunito': nunito,
  'Playfair Display': playfair,
  'Merriweather': merriweather,
  'Roboto Slab': robotoSlab,
  'Dancing Script': dancingScript,
  'Caveat': caveat,
  'Pacifico': pacifico,
  'Lobster': lobster,
  'Righteous': righteous,
  'Bangers': bangers,
  'Orbitron': orbitron,
};

// Function to get font class name
export const getFontClass = (fontFamily: string): string => {
  const googleFont = GOOGLE_FONTS[fontFamily as keyof typeof GOOGLE_FONTS];
  return googleFont ? googleFont.className : '';
};

// Function to load font into CSS
export const loadGoogleFont = (fontFamily: string): void => {
  const googleFont = GOOGLE_FONTS[fontFamily as keyof typeof GOOGLE_FONTS];
  if (googleFont && typeof document !== 'undefined') {
    // Add font class to document head if not already present
    const existingStyle = document.querySelector(`style[data-font="${fontFamily}"]`);
    if (!existingStyle) {
      const style = document.createElement('style');
      style.setAttribute('data-font', fontFamily);
      style.textContent = `.${googleFont.className} { font-family: ${fontFamily}, sans-serif; }`;
      document.head.appendChild(style);
    }
  }
};