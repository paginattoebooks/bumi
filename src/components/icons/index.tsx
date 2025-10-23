import React from 'react';

const createIcon = (label: string) => {
  return (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={label}
      role="img"
      {...props}
    >
      <title>{label}</title>
      <circle cx="12" cy="12" r="9" stroke="currentColor" />
      <path d="M8 12h8" stroke="currentColor" />
    </svg>
  );
};

export const Home = createIcon('Home');
export const Search = createIcon('Search');
export const Users = createIcon('Users');
export const BookOpen = createIcon('BookOpen');
export const User = createIcon('User');
export const Heart = createIcon('Heart');
export const MessageCircle = createIcon('MessageCircle');
export const Share2 = createIcon('Share2');
export const Settings = createIcon('Settings');
export const Bell = createIcon('Bell');
export const Plus = createIcon('Plus');
export const ChevronLeft = createIcon('ChevronLeft');
export const Eye = createIcon('Eye');
export const Download = createIcon('Download');
export const Flag = createIcon('Flag');
export const Lock = createIcon('Lock');
export const Menu = createIcon('Menu');
export const X = createIcon('X');
export const Sun = createIcon('Sun');
export const Moon = createIcon('Moon');
export const Check = createIcon('Check');
export const Star = createIcon('Star');
export const TrendingUp = createIcon('TrendingUp');
export const Filter = createIcon('Filter');
export const Crown = createIcon('Crown');
export const Scan = createIcon('Scan');
export const Camera = createIcon('Camera');
export const Droplets = createIcon('Droplets');
export const SunMedium = createIcon('SunMedium');
export const Leaf = createIcon('Leaf');
export const Play = createIcon('Play');
export const Pause = createIcon('Pause');
export const Volume2 = createIcon('Volume2');
export const VolumeX = createIcon('VolumeX');
export const Maximize = createIcon('Maximize');
export const AlertCircle = createIcon('AlertCircle');
export const CheckCircle = createIcon('CheckCircle');
export const XCircle = createIcon('XCircle');

export default {};
