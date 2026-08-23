import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3 19 6v5c0 4.7-2.8 8.3-7 10-4.2-1.7-7-5.3-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></IconBase>;
}

export function ShieldIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3 19 6v5c0 4.7-2.8 8.3-7 10-4.2-1.7-7-5.3-7-10V6l7-3Z"/></IconBase>;
}

export function OrdersIcon(props: IconProps) {
  return <IconBase {...props}><rect x="5" y="4" width="14" height="16" rx="3"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h4"/></IconBase>;
}

export function BoltIcon(props: IconProps) {
  return <IconBase {...props}><path d="m13 2-8 12h6l-1 8 9-13h-6V2Z"/></IconBase>;
}

export function MailIcon(props: IconProps) {
  return <IconBase {...props}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></IconBase>;
}

export function LockIcon(props: IconProps) {
  return <IconBase {...props}><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></IconBase>;
}

export function EyeIcon(props: IconProps) {
  return <IconBase {...props}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></IconBase>;
}

export function EyeOffIcon(props: IconProps) {
  return <IconBase {...props}><path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.3 3M6.2 6.2C3.9 8 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5M9.9 9.9a3 3 0 0 0 4.2 4.2"/></IconBase>;
}

export function UserIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></IconBase>;
}

export function UserPlusIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="9" cy="8" r="4"/><path d="M2.5 21a6.5 6.5 0 0 1 13 0M18 8v6M15 11h6"/></IconBase>;
}

export function WhatsAppIcon(props: IconProps) {
  return <IconBase {...props}><path d="M20 11.7a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4.1A8 8 0 1 1 20 11.7Z"/><path d="M8.8 8.4c.3-.7.6-.7 1-.7h.4c.1 0 .3.1.4.4l.8 2c.1.3 0 .5-.1.7l-.6.8c-.2.2-.1.5.1.7.7 1.2 1.7 2.1 3 2.7.3.1.5.1.7-.1l.9-1.1c.2-.2.4-.3.7-.2l1.9.9c.3.1.5.2.5.4.1.2.1 1-.3 1.9-.4.8-1.7 1.5-2.5 1.6-.7.1-1.6.2-4.4-1-3.5-1.5-5.7-5.1-5.9-5.4-.2-.3-1.4-1.9-1.4-3.6 0-1.7.9-2.6 1.3-3Z" transform="scale(.62) translate(7.1 7.4)"/></IconBase>;
}

export function AlertIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></IconBase>;
}

export function ChevronDownIcon(props: IconProps) {
  return <IconBase {...props}><path d="m7 10 5 5 5-5"/></IconBase>;
}
