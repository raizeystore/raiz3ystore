import type { SVGProps } from "react";
import {
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  UserPlus,
  UserRound,
  Zap,
  type LucideProps,
} from "lucide-react";

function decorativeProps(props: LucideProps) {
  return {
    ...props,
    strokeWidth: 2,
    "aria-hidden": true as const,
    focusable: false as const,
  };
}

export function ShieldCheckIcon(props: LucideProps) {
  return <ShieldCheck {...decorativeProps(props)} />;
}

export function ShieldIcon(props: LucideProps) {
  return <Shield {...decorativeProps(props)} />;
}

export function OrdersIcon(props: LucideProps) {
  return <ClipboardList {...decorativeProps(props)} />;
}

export function BoltIcon(props: LucideProps) {
  return <Zap {...decorativeProps(props)} />;
}

export function MailIcon(props: LucideProps) {
  return <Mail {...decorativeProps(props)} />;
}

export function LockIcon(props: LucideProps) {
  return <Lock {...decorativeProps(props)} />;
}

export function EyeIcon(props: LucideProps) {
  return <Eye {...decorativeProps(props)} />;
}

export function EyeOffIcon(props: LucideProps) {
  return <EyeOff {...decorativeProps(props)} />;
}

export function UserIcon(props: LucideProps) {
  return <UserRound {...decorativeProps(props)} />;
}

export function UserPlusIcon(props: LucideProps) {
  return <UserPlus {...decorativeProps(props)} />;
}

export function AlertIcon(props: LucideProps) {
  return <CircleAlert {...decorativeProps(props)} />;
}

export function ChevronDownIcon(props: LucideProps) {
  return <ChevronDown {...decorativeProps(props)} />;
}

/**
 * WhatsApp is a brand mark, so it intentionally stays as a custom SVG rather
 * than being replaced by a generic functional icon.
 */
export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M20 11.7a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4.1A8 8 0 1 1 20 11.7Z" />
      <path d="M8.8 8.4c.3-.7.6-.7 1-.7h.4c.1 0 .3.1.4.4l.8 2c.1.3 0 .5-.1.7l-.6.8c-.2.2-.1.5.1.7.7 1.2 1.7 2.1 3 2.7.3.1.5.1.7-.1l.9-1.1c.2-.2.4-.3.7-.2l1.9.9c.3.1.5.2.5.4.1.2.1 1-.3 1.9-.4.8-1.7 1.5-2.5 1.6-.7.1-1.6.2-4.4-1-3.5-1.5-5.7-5.1-5.9-5.4-.2-.3-1.4-1.9-1.4-3.6 0-1.7.9-2.6 1.3-3Z" transform="scale(.62) translate(7.1 7.4)" />
    </svg>
  );
}
