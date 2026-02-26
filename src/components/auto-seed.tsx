"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_SELLER = {
  company_name: "AMERICAN RECLAMATION CORP.",
  address: "4418 BLUEBONNET DRIVE, SUITE 407, STAFFORD, TX 77477",
  contact_person: "F. BLANCO",
  phone: "+1 646 404 4643",
  fax: "+1 770 239 7508",
  email: "contact@usreclam.com",
  bank_name: "Chase Bank (J.P. Morgan Chase Bank N.A.)",
  account_number: "802 562 645",
  routing_number: "021000021",
  swift_code: "CHASUS33",
  bank_address: "118-30, Queens Boulevard, Kew Gardens, NY 11375",
  is_default: true,
};

const DEFAULT_BUYER = {
  name: "BALKRISHAN ISPAT PVT. LTD.",
  address:
    "PLOT NO. 225, INDUSTRIAL AREA, PHASE-2, PANCHKULA, HARYANA 134113 INDIA",
  gst_no: "06AAHCB5765N1ZZ",
  pan_no: "AAHCB5765N",
  ie_code: "0505044657",
  email: "balkrishan@gmail.com",
  phone: "+91 9876543210",
};

const DEFAULT_COMMODITY = {
  description:
    "LOW ALLOY STEEL SCRAP DISCARDED ROLLS FOR MELTING PURPOSE (ISRI 202 BIRCH CLIFF)",
  hs_code: "72042990",
  basel_no: "B-1010",
  packing_type: "LOOSE IN CONTAINER",
};

export function AutoSeed({ children }: { children: React.ReactNode }) {
  const seeded = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    async function seed() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setReady(true);
        return;
      }

      // Delete any seller with empty company_name, then ensure one exists
      const { data: sellers } = await supabase
        .from("sellers")
        .select("id, company_name")
        .eq("user_id", user.id);

      if (sellers) {
        // Remove broken records (empty company_name)
        const broken = sellers.filter((s) => !s.company_name);
        for (const s of broken) {
          await supabase.from("sellers").delete().eq("id", s.id);
        }

        const valid = sellers.filter((s) => !!s.company_name);
        if (valid.length === 0) {
          await supabase
            .from("sellers")
            .insert({ ...DEFAULT_SELLER, user_id: user.id });
        }
      } else {
        await supabase
          .from("sellers")
          .insert({ ...DEFAULT_SELLER, user_id: user.id });
      }

      // Same for buyers
      const { data: buyerRows } = await supabase
        .from("buyers")
        .select("id, name")
        .eq("user_id", user.id);

      if (buyerRows) {
        const broken = buyerRows.filter((b) => !b.name);
        for (const b of broken) {
          await supabase.from("buyers").delete().eq("id", b.id);
        }
        const valid = buyerRows.filter((b) => !!b.name);
        if (valid.length === 0) {
          await supabase
            .from("buyers")
            .insert({ ...DEFAULT_BUYER, user_id: user.id });
        }
      } else {
        await supabase
          .from("buyers")
          .insert({ ...DEFAULT_BUYER, user_id: user.id });
      }

      // Same for commodities
      const { data: commodities } = await supabase
        .from("commodities")
        .select("id, description")
        .eq("user_id", user.id);

      if (commodities) {
        const broken = commodities.filter((c) => !c.description);
        for (const c of broken) {
          await supabase.from("commodities").delete().eq("id", c.id);
        }

        const valid = commodities.filter((c) => !!c.description);
        if (valid.length === 0) {
          await supabase
            .from("commodities")
            .insert({ ...DEFAULT_COMMODITY, user_id: user.id });
        }
      } else {
        await supabase
          .from("commodities")
          .insert({ ...DEFAULT_COMMODITY, user_id: user.id });
      }

      setReady(true);
    }

    seed();
  }, []);

  // Show a brief loading state until seed is complete to prevent race conditions
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
