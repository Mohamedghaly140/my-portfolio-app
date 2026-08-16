import type { ContactChannelItem } from "@/components/channel-list";

import { CONTACT_EMAIL, CONTACT_MAILTO, CONTACT_PHONE, CONTACT_TEL, CONTACT_WHATSAPP } from "./contact";

// App-only UI data, not portfolio content — deliberately kept out of contact.ts,
// which `scripts/sync-content.ts` overwrites wholesale from the web repo.
export const CONTACT_CHANNELS: ContactChannelItem[] = [
  {
    id: "email",
    label: "Email",
    value: CONTACT_EMAIL,
    href: CONTACT_MAILTO,
    icon: "mail-outline",
  },
  {
    id: "phone",
    label: "Phone",
    value: CONTACT_PHONE,
    href: CONTACT_TEL,
    icon: "call-outline",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: CONTACT_PHONE,
    href: CONTACT_WHATSAPP,
    icon: "logo-whatsapp",
  },
];
