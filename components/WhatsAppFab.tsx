import { waLink } from "@/lib/site";
import { WhatsApp } from "./Icons";

export default function WhatsAppFab() {
  return (
    <a href={waLink()} aria-label="Chat with Zetta Tech on WhatsApp" className="fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded bg-navy-900 text-cyan-brand shadow-lg sm:hidden">
      <WhatsApp className="h-6 w-6" />
    </a>
  );
}
