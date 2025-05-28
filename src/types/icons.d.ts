declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module './Icons' {
  import { FC, SVGProps } from 'react';
  
  interface IconProps {
    className?: string;
  }
  
  export const FacebookIcon: FC<IconProps>;
  export const InstagramIcon: FC<IconProps>;
  export const TwitterIcon: FC<IconProps>;
  export const ShoppingCartIcon: FC<IconProps>;
  export const Bars3Icon: FC<IconProps>;
  export const XMarkIcon: FC<IconProps>;
}
