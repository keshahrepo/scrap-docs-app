"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DOCUMENTS } from "@/types/document";
import type { ShipmentWithRelations } from "@/types/shipment";
import { amountInWords } from "@/lib/number-to-words";

export default function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supabase = createClient();
  const [shipment, setShipment] = useState<ShipmentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("shipments")
        .select(
          "*, seller:sellers(*), buyer:buyers(*), commodity:commodities(*), containers(*)"
        )
        .eq("id", id)
        .single();

      if (data) {
        const s = data as unknown as ShipmentWithRelations;
        s.containers.sort((a, b) => a.sequence_number - b.sequence_number);
        setShipment(s);
      }
      setLoading(false);
    }
    load();
  }, [supabase, id]);

  async function downloadDoc(type: string, filename: string) {
    setDownloading(type);
    try {
      const res = await fetch(`/api/documents/${id}?type=${type}`);
      if (!res.ok) throw new Error("Failed to generate document");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download document");
    }
    setDownloading(null);
  }

  async function downloadAll() {
    setDownloading("all");
    try {
      const res = await fetch(`/api/documents/${id}/all`);
      if (!res.ok) throw new Error("Failed to generate documents");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Shipment_${shipment?.invoice_number || id}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download documents");
    }
    setDownloading(null);
  }

  async function updateStatus(status: string) {
    const { error } = await supabase
      .from("shipments")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      setShipment((prev) =>
        prev ? { ...prev, status: status as "draft" | "final" | "shipped" } : prev
      );
      toast.success(`Status updated to ${status}`);
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  if (!shipment) {
    return <div className="py-12 text-center text-muted-foreground">Shipment not found.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{shipment.invoice_number}</h2>
            <p className="text-muted-foreground">
              {format(new Date(shipment.invoice_date), "dd MMMM yyyy")}
            </p>
          </div>
          <Badge
            variant={
              shipment.status === "draft"
                ? "secondary"
                : shipment.status === "final"
                  ? "default"
                  : "outline"
            }
          >
            {shipment.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {shipment.status === "draft" && (
            <Button variant="outline" onClick={() => updateStatus("final")}>
              Mark Final
            </Button>
          )}
          {shipment.status === "final" && (
            <Button variant="outline" onClick={() => updateStatus("shipped")}>
              Mark Shipped
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/shipments/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Shipment Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seller / Exporter</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-semibold">{shipment.seller.company_name}</p>
            <p>{shipment.seller.address}</p>
            <p>{shipment.seller.phone}</p>
            <p>{shipment.seller.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Buyer / Consignee</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-semibold">{shipment.buyer.name}</p>
            <p>{shipment.buyer.address}</p>
            <p>GST: {shipment.buyer.gst_no}</p>
            <p>IE: {shipment.buyer.ie_code}</p>
            <p>{shipment.buyer.email}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipment Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="text-muted-foreground">B/L Number:</span>{" "}
              {shipment.bl_number || "-"}
            </div>
            <div>
              <span className="text-muted-foreground">Vessel:</span>{" "}
              {shipment.vessel_name} {shipment.voyage_number && `V. ${shipment.voyage_number}`}
            </div>
            <div>
              <span className="text-muted-foreground">Loading:</span>{" "}
              {shipment.port_of_loading}
            </div>
            <div>
              <span className="text-muted-foreground">Discharge:</span>{" "}
              {shipment.port_of_discharge}
            </div>
            <div>
              <span className="text-muted-foreground">Destination:</span>{" "}
              {shipment.final_destination}
            </div>
            <div>
              <span className="text-muted-foreground">Contract Ref:</span>{" "}
              {shipment.sales_contract_ref || "-"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commodity & Containers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cargo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <p className="font-semibold">{shipment.commodity.description}</p>
            <p className="text-muted-foreground">
              HS: {shipment.commodity.hs_code} | Basel: {shipment.commodity.basel_no}
            </p>
          </div>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Container</th>
                  <th className="px-3 py-2 text-left">Seal</th>
                  <th className="px-3 py-2 text-right">Gross (MT)</th>
                  <th className="px-3 py-2 text-right">Tare (MT)</th>
                  <th className="px-3 py-2 text-right">Net (MT)</th>
                </tr>
              </thead>
              <tbody>
                {shipment.containers.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="px-3 py-2">{c.sequence_number}</td>
                    <td className="px-3 py-2 font-mono">{c.container_number}</td>
                    <td className="px-3 py-2">{c.seal_number}</td>
                    <td className="px-3 py-2 text-right">
                      {Number(c.gross_weight_mt).toFixed(3)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(c.tare_weight_mt).toFixed(3)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {Number(c.net_weight_mt).toFixed(3)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/50 font-semibold">
                  <td className="px-3 py-2" colSpan={3}>
                    Total ({shipment.containers.length} containers)
                  </td>
                  <td className="px-3 py-2 text-right">
                    {Number(shipment.total_gross_weight).toFixed(3)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {Number(shipment.total_tare_weight).toFixed(3)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {Number(shipment.total_net_weight).toFixed(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Rate</span>
            <span>
              {shipment.currency} {Number(shipment.rate_per_mt).toFixed(2)} per MT{" "}
              {shipment.incoterms} {shipment.incoterms_destination}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total Amount</span>
            <span>
              {shipment.currency}{" "}
              {Number(shipment.total_amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          {Number(shipment.total_amount) > 0 && (
            <p className="text-xs text-muted-foreground">
              ({amountInWords(Number(shipment.total_amount))})
            </p>
          )}
          <div className="flex justify-between">
            <span>Advance Paid</span>
            <span>
              {shipment.currency} {Number(shipment.advance_paid).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Balance Due</span>
            <span>
              {shipment.currency}{" "}
              {Number(shipment.balance_due).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          {shipment.payment_terms && (
            <div className="pt-2">
              <span className="text-muted-foreground">Payment Terms:</span>{" "}
              {shipment.payment_terms}
            </div>
          )}
          {(Number(shipment.purchase_cost_per_mt) > 0 || Number(shipment.other_costs) > 0) && (
            <>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Profitability
              </p>
              <div className="flex justify-between">
                <span>Purchase Cost</span>
                <span>
                  {shipment.currency} {Number(shipment.purchase_cost_per_mt).toFixed(2)} per MT
                </span>
              </div>
              {Number(shipment.other_costs) > 0 && (
                <div className="flex justify-between">
                  <span>Other Costs</span>
                  <span>
                    {shipment.currency} {Number(shipment.other_costs).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total Cost</span>
                <span>
                  {shipment.currency}{" "}
                  {Number(shipment.total_cost).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {(() => {
                const profit = Number(shipment.total_amount) - Number(shipment.total_cost);
                const margin = Number(shipment.total_amount) > 0
                  ? (profit / Number(shipment.total_amount)) * 100
                  : 0;
                return (
                  <div className="flex justify-between text-base font-semibold">
                    <span>Profit</span>
                    <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                      {shipment.currency}{" "}
                      {profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      {" "}({margin.toFixed(1)}%)
                    </span>
                  </div>
                );
              })()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Documents</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={downloadAll}
                disabled={downloading === "all"}
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading === "all" ? "Generating..." : "Download All (ZIP)"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DOCUMENTS.map((doc) => (
              <div
                key={doc.type}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.label}</p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {doc.format}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    downloadDoc(
                      doc.type,
                      doc.filename(shipment.invoice_number)
                    )
                  }
                  disabled={downloading === doc.type}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloading === doc.type ? "..." : "Download"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
