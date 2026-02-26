"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Seller } from "@/types/shipment";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [form, setForm] = useState({
    company_name: "",
    address: "",
    contact_person: "",
    phone: "",
    fax: "",
    email: "",
    bank_name: "",
    account_number: "",
    routing_number: "",
    swift_code: "",
    bank_address: "",
  });

  useEffect(() => {
    async function load(retries = 3) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("sellers")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .single();

      if (data) {
        const seller = data as Seller;
        setSellerId(seller.id);
        setForm({
          company_name: seller.company_name || "",
          address: seller.address || "",
          contact_person: seller.contact_person || "",
          phone: seller.phone || "",
          fax: seller.fax || "",
          email: seller.email || "",
          bank_name: seller.bank_name || "",
          account_number: seller.account_number || "",
          routing_number: seller.routing_number || "",
          swift_code: seller.swift_code || "",
          bank_address: seller.bank_address || "",
        });
      } else if (retries > 0) {
        // AutoSeed may still be creating the record — retry shortly
        setTimeout(() => load(retries - 1), 500);
      }
    }
    load();
  }, [supabase]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = { ...form, user_id: user.id, is_default: true };

    if (sellerId) {
      const { error } = await supabase
        .from("sellers")
        .update(payload)
        .eq("id", sellerId);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Company info saved");
      }
    } else {
      const { data, error } = await supabase
        .from("sellers")
        .insert(payload)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
      } else {
        setSellerId(data.id);
        toast.success("Company info saved");
      }
    }
    setLoading(false);
  }

  const fields: { label: string; key: string; placeholder: string }[] = [
    {
      label: "Company Name",
      key: "company_name",
      placeholder: "AMERICAN RECLAMATION CORP.",
    },
    {
      label: "Address",
      key: "address",
      placeholder: "4418 BLUEBONNET DRIVE, SUITE 407, STAFFORD, TX 77477",
    },
    {
      label: "Contact Person",
      key: "contact_person",
      placeholder: "F. BLANCO",
    },
    { label: "Phone", key: "phone", placeholder: "+1 646 404 4643" },
    { label: "Fax", key: "fax", placeholder: "+1 770 239 7508" },
    { label: "Email", key: "email", placeholder: "contact@usreclam.com" },
  ];

  const bankFields: { label: string; key: string; placeholder: string }[] = [
    {
      label: "Bank Name",
      key: "bank_name",
      placeholder: "Chase Bank (J.P. Morgan Chase Bank N.A.)",
    },
    {
      label: "Account Number",
      key: "account_number",
      placeholder: "802 562 645",
    },
    {
      label: "Routing Number",
      key: "routing_number",
      placeholder: "021000021",
    },
    { label: "SWIFT Code", key: "swift_code", placeholder: "CHASUS33" },
    {
      label: "Bank Address",
      key: "bank_address",
      placeholder: "118-30, Queens Boulevard, Kew Gardens, NY 11375",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Your company information (used as the seller/exporter on all
          documents)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            This appears as the exporter on all generated documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              <Input
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
          <CardDescription>
            Payment information shown on invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankFields.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              <Input
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
