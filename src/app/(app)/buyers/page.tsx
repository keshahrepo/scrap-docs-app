"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Buyer } from "@/types/shipment";

const emptyBuyer = {
  name: "",
  address: "",
  gst_no: "",
  pan_no: "",
  ie_code: "",
  email: "",
  phone: "",
  contact_person: "",
};

export default function BuyersPage() {
  const supabase = createClient();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyBuyer);
  const [loading, setLoading] = useState(false);

  const loadBuyers = useCallback(async () => {
    const { data } = await supabase
      .from("buyers")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBuyers(data as Buyer[]);
  }, [supabase]);

  useEffect(() => {
    loadBuyers();
  }, [loadBuyers]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyBuyer);
    setDialogOpen(true);
  }

  function openEdit(buyer: Buyer) {
    setEditingId(buyer.id);
    setForm({
      name: buyer.name || "",
      address: buyer.address || "",
      gst_no: buyer.gst_no || "",
      pan_no: buyer.pan_no || "",
      ie_code: buyer.ie_code || "",
      email: buyer.email || "",
      phone: buyer.phone || "",
      contact_person: buyer.contact_person || "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (editingId) {
      const { error } = await supabase
        .from("buyers")
        .update(form)
        .eq("id", editingId);
      if (error) toast.error(error.message);
      else toast.success("Buyer updated");
    } else {
      const { error } = await supabase
        .from("buyers")
        .insert({ ...form, user_id: user.id });
      if (error) toast.error(error.message);
      else toast.success("Buyer added");
    }

    setLoading(false);
    setDialogOpen(false);
    loadBuyers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this buyer?")) return;
    const { error } = await supabase.from("buyers").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Buyer deleted");
      loadBuyers();
    }
  }

  const formFields = [
    { key: "name", label: "Name", placeholder: "BALKRISHAN PARMANAND" },
    {
      key: "address",
      label: "Address",
      placeholder:
        "G.T. ROAD, SIRHIND SIDE, MANDI GOBINDGARH, PUNJAB-147301, INDIA",
    },
    { key: "gst_no", label: "GST No", placeholder: "03ADDPG2370D1ZB" },
    { key: "pan_no", label: "PAN No", placeholder: "ADDPG2370D" },
    { key: "ie_code", label: "IE Code", placeholder: "3001006765" },
    {
      key: "email",
      label: "Email",
      placeholder: "BALKRISHAN.PARMANAND@HOTMAIL.COM",
    },
    { key: "phone", label: "Phone", placeholder: "" },
    { key: "contact_person", label: "Contact Person", placeholder: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Buyers</h2>
          <p className="text-muted-foreground">
            Manage your buyer/consignee information
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Buyer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Buyer" : "Add Buyer"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {formFields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label>{f.label}</Label>
                  <Input
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                  />
                </div>
              ))}
              <Button
                onClick={handleSave}
                disabled={loading || !form.name}
                className="w-full"
              >
                {loading ? "Saving..." : editingId ? "Update" : "Add Buyer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {buyers.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No buyers yet. Add your first buyer to get started.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">GST No</TableHead>
                <TableHead className="hidden lg:table-cell">IE Code</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.map((buyer) => (
                <TableRow key={buyer.id}>
                  <TableCell className="font-medium">{buyer.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {buyer.email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {buyer.gst_no}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {buyer.ie_code}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(buyer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(buyer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
