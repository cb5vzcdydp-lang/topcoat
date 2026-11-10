/** React adaptations of Topcoat UI's card/button registry. See LICENSE and docs/TOPCOAT_UI.md. */
import type {ButtonHTMLAttributes, HTMLAttributes} from 'react';

/** Keep native article semantics, children and caller styles; no wrapper or runtime state. */
export function TopcoatCard({className = '', ...props}: HTMLAttributes<HTMLElement>) {
  return <article data-slot="topcoat-card" className={className} {...props}/>;
}

export function TopcoatButton({variant = 'secondary', className = '', type = 'button', ...props}: ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary' | 'secondary' | 'outline' | 'ghost'}) {
  return <button type={type} data-slot="topcoat-button" data-variant={variant} className={`btn ${className}`} {...props}/>;
}
