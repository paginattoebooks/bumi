import * as React from "react";
import { cn } from "@/lib/utils";

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type ImgProps = React.ImgHTMLAttributes<HTMLImageElement>;

export function Avatar({
  src,
  alt,
  className,
  ...rest
}: { src?: string; alt?: string; className?: string } & DivProps) {
  return (
    <div
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 overflow-hidden",
        className
      )}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-medium text-gray-600">
          {alt?.[0] || ""}
        </span>
      )}
    </div>
  );
}

export function AvatarImage({
  src,
  alt,
  className,
  ...rest
}: { src?: string; alt?: string; className?: string } & ImgProps) {
  // aceita onClick, className etc. (ImgProps)
  return <img src={src} alt={alt ?? ""} className={cn("h-full w-full object-cover", className)} {...rest} />;
}

export function AvatarFallback({
  children,
  className,
  ...rest
}: { children?: React.ReactNode; className?: string } & DivProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gray-300 text-gray-600",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

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
