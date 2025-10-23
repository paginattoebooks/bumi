import React from 'react';

export const Avatar: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { children?: React.ReactNode }> = ({ src, alt, children, ...props }) => (
  <div className="inline-flex items-center justify-center rounded-full overflow-hidden w-10 h-10 bg-gray-100">
    {src ? <img src={src} alt={alt} {...props} /> : children}
  </div>
);

export const AvatarImage = Avatar;

export const AvatarFallback: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="w-10 h-10 flex items-center justify-center text-sm text-gray-600">{children}</div>
);

export default Avatar;
