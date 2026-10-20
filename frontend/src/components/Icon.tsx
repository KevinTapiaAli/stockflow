export type IconName = 'grid' | 'box' | 'layers' | 'arrows' | 'cart' | 'plus' | 'arrow' | 'close' | 'menu' | 'check';
const paths: Record<IconName, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  box: 'm3 7 9-5 9 5v10l-9 5-9-5Zm0 0 9 5 9-5M12 12v10M7 4.8l10 5.5',
  layers: 'm12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5',
  arrows: 'M3 7h17m-5-5 5 5-5 5M21 17H4m5-5-5 5 5 5',
  cart: 'M2 3h3l3 13h11l3-10H6M9 21h.01M18 21h.01',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  close: 'm6 6 12 12M6 18 18 6',
  menu: 'M3 6h18M3 12h18M3 18h18',
  check: 'm5 12 4 4L19 6',
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
