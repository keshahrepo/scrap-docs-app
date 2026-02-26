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
import type { Commodity } from "@/types/shipment";

const emptyCommodity = {
  description: "",
  hs_code: "72042990",
  basel_no: "B-1010",
  packing_type: "LOOSE IN CONTAINER",
};

export default function CommoditiesPage() {
  const supabase = createClient();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCommodity);
  const [loading, setLoading] = useState(false);

  const loadCommodities = useCallback(async () => {
    const { data } = await supabase
      .from("commodities")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCommodities(data as Commodity[]);
  }, [supabase]);

  useEffect(() => {
    loadCommodities();
  }, [loadCommodities]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyCommodity);
    setDialogOpen(true);
  }

  function openEdit(commodity: Commodity) {
    setEditingId(commodity.id);
    setForm({
      description: commodity.description || "",
      hs_code: commodity.hs_code || "72042990",
      basel_no: commodity.basel_no || "B-1010",
      packing_type: commodity.packing_type || "LOOSE IN CONTAINER",
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
        .from("commodities")
        .update(form)
        .eq("id", editingId);
      if (error) toast.error(error.message);
      else toast.success("Commodity updated");
    } else {
      const { error } = await supabase
        .from("commodities")
        .insert({ ...form, user_id: user.id });
      if (error) toast.error(error.message);
      else toast.success("Commodity added");
    }

    setLoading(false);
    setDialogOpen(false);
    loadCommodities();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this commodity?")) return;
    const { error } = await supabase
      .from("commodities")
      .delete()
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Commodity deleted");
      loadCommodities();
    }
  }

  const formFields = [
    {
      key: "description",
      label: "Description",
      placeholder: "LOW ALLOY STEEL SCRAP DISCARDED ROLLS FOR MELTING PURPOSE",
    },
    { key: "hs_code", label: "HS Code", placeholder: "72042990" },
    { key: "basel_no", label: "Basel No", placeholder: "B-1010" },
    {
      key: "packing_type",
      label: "Packing Type",
      placeholder: "LOOSE IN CONTAINER",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Commodities</h2>
          <p className="text-muted-foreground">
            Manage your commodity/material types
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Commodity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Commodity" : "Add Commodity"}
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
                disabled={loading || !form.description}
                className="w-full"
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update"
                    : "Add Commodity"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {commodities.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No commodities yet. Add your first commodity to get started.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>HS Code</TableHead>
                <TableHead className="hidden md:table-cell">
                  Basel No
                </TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commodities.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {c.description}
                  </TableCell>
                  <TableCell>{c.hs_code}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {c.basel_no}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c.id)}
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
