import { Phone, WhatsApp } from "./Icons";
import { site, waLink } from "@/lib/site";

/**
 * Mobile contact bar.
 *
 * Two full-height targets pinned to the bottom of the viewport on phones only:
 * Call dials the office number, WhatsApp opens the chat. It replaces the old pair
 * of floating buttons, which sat over the content and duplicated the header's
 * enquiry button.
 *
 * On desktop the header and footer already carry both actions, so the bar is hidden.
 * `body` reserves the bar's height (see globals.css) so it never covers the footer.
 */
export default function MobileBar() {
  return (
    <div className="mobile-bar lg:hidden" role="navigation" aria-label="Contact Zetta Tech">
      <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="mobile-bar-action">
        <Phone className="h-[1.15rem] w-[1.15rem]" />
        <span>Call</span>
      </a>
      <a href={waLink()} className="mobile-bar-action is-whatsapp">
        <WhatsApp className="h-[1.15rem] w-[1.15rem]" />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
