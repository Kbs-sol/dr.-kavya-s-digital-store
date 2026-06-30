import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex flex-col items-start leading-none ${className}`}>
      <span className="font-display italic text-2xl text-brand-brown">Dr. Kavya's</span>
      <span className="font-wordmark text-[10px] text-brand-gold mt-0.5">Hair &amp; Skin Care</span>
    </Link>
  );
}