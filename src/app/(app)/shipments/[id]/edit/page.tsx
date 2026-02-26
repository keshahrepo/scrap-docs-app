"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type {
  Seller,
  Buyer,
  Commodity,
  ShipmentWithRelations,
} from "@/types/shipment";

interface ContainerInput {
  container_number: string;
  seal_number: string;
  container_size: string;
  gross_weight_mt: string;
  tare_weight_mt: string;
}

export default function EditShipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);

  const [sellerId, setSellerId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [commodityId, setCommodityId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [blNumber, setBlNumber] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [voyageNumber, setVoyageNumber] = useState("");
  const [portOfLoading, setPortOfLoading] = useState("");
  const [portOfDischarge, setPortOfDischarge] = useState("");
  const [finalDestination, setFinalDestination] = useState("");
  const [placeOfReceipt, setPlaceOfReceipt] = useState("");
  const [salesContractRef, setSalesContractRef] = useState("");
  const [ratPerMt, setRatPerMt] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [incoterms, setIncoterms] = useState("CIF");
  const [incotermsDestination, setIncotermsDestination] = useState("");
  const [advancePaid, setAdvancePaid] = useState("0");
  const [freightPerContainer, setFreightPerContainer] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [purchaseCostPerMt, setPurchaseCostPerMt] = useState("0");
  const [otherCosts, setOtherCosts] = useState("0");
  const [containers, setContainers] = useState<ContainerInput[]>([]);

  useEffect(() => {
    async function load() {
      const [sellersRes, buyersRes, commoditiesRes, shipmentRes] =
        await Promise.all([
          supabase.from("sellers").select("*"),
          supabase.from("buyers").select("*").order("name"),
          supabase.from("commodities").select("*").order("description"),
          supabase
            .from("shipments")
            .select(
              "*, seller:sellers(*), buyer:buyers(*), commodity:commodities(*), containers(*)"
            )
            .eq("id", id)
            .single(),
        ]);

      if (sellersRes.data) setSellers(sellersRes.data as Seller[]);
      if (buyersRes.data) setBuyers(buyersRes.data as Buyer[]);
      if (commoditiesRes.data)
        setCommodities(commoditiesRes.data as Commodity[]);

      if (shipmentRes.data) {
        const s = shipmentRes.data as unknown as ShipmentWithRelations;
        setSellerId(s.seller_id);
        setBuyerId(s.buyer_id);
        setCommodityId(s.commodity_id);
        setInvoiceNumber(s.invoice_number);
        setInvoiceDate(s.invoice_date);
        setBlNumber(s.bl_number || "");
        setVesselName(s.vessel_name || "");
        setVoyageNumber(s.voyage_number || "");
        setPortOfLoading(s.port_of_loading || "");
        setPortOfDischarge(s.port_of_discharge || "");
        setFinalDestination(s.final_destination || "");
        setPlaceOfReceipt(s.place_of_receipt || "");
        setSalesContractRef(s.sales_contract_ref || "");
        setRatPerMt(String(s.rate_per_mt));
        setCurrency(s.currency);
        setIncoterms(s.incoterms);
        setIncotermsDestination(s.incoterms_destination || "");
        setAdvancePaid(String(s.advance_paid));
        setFreightPerContainer(
          s.freight_per_container ? String(s.freight_per_container) : ""
        );
        setPaymentTerms(s.payment_terms || "");
        setPurchaseCostPerMt(String(s.purchase_cost_per_mt || 0));
        setOtherCosts(String(s.other_costs || 0));
        setContainers(
          s.containers
            .sort((a, b) => a.sequence_number - b.sequence_number)
            .map((c) => ({
              container_number: c.container_number,
              seal_number: c.seal_number || "",
              container_size: c.container_size || "20",
              gross_weight_mt: String(c.gross_weight_mt),
              tare_weight_mt: String(c.tare_weight_mt),
            }))
        );
      }
      setLoading(false);
    }
    load();
  }, [supabase, id]);

  const totalGross = containers.reduce(
    (sum, c) => sum + (parseFloat(c.gross_weight_mt) || 0),
    0
  );
  const totalTare = containers.reduce(
    (sum, c) => sum + (parseFloat(c.tare_weight_mt) || 0),
    0
  );
  const totalNet = totalGross - totalTare;
  const rate = parseFloat(ratPerMt) || 0;
  const totalAmount = totalNet * rate;
  const advance = parseFloat(advancePaid) || 0;
  const balanceDue = totalAmount - advance;
  const purchaseCost = parseFloat(purchaseCostPerMt) || 0;
  const otherCost = parseFloat(otherCosts) || 0;
  const totalCost = purchaseCost * totalNet + otherCost;
  const profit = totalAmount - totalCost;
  const margin = totalAmount > 0 ? (profit / totalAmount) * 100 : 0;

  function updateContainer(index: number, field: string, value: string) {
    setContainers((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function addContainer() {
    setContainers((prev) => [
      ...prev,
      {
        container_number: "",
        seal_number: "",
        container_size: "20",
        gross_weight_mt: "",
        tare_weight_mt: "",
      },
    ]);
  }

  function removeContainer(index: number) {
    if (containers.length <= 1) return;
    setContainers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error: shipmentError } = await supabase
        .from("shipments")
        .update({
          seller_id: sellerId,
          buyer_id: buyerId,
          commodity_id: commodityId,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDate,
          bl_number: blNumber || null,
          vessel_name: vesselName || null,
          voyage_number: voyageNumber || null,
          port_of_loading: portOfLoading || null,
          port_of_discharge: portOfDischarge || null,
          final_destination: finalDestination || null,
          place_of_receipt: placeOfReceipt || null,
          sales_contract_ref: salesContractRef || null,
          rate_per_mt: rate,
          currency,
          incoterms,
          incoterms_destination: incotermsDestination || null,
          advance_paid: advance,
          freight_per_container: parseFloat(freightPerContainer) || null,
          payment_terms: paymentTerms || null,
          total_containers: containers.length,
          total_gross_weight: totalGross,
          total_tare_weight: totalTare,
          total_net_weight: totalNet,
          total_amount: totalAmount,
          balance_due: balanceDue,
          purchase_cost_per_mt: purchaseCost,
          other_costs: otherCost,
          total_cost: totalCost,
        })
        .eq("id", id);

      if (shipmentError) throw shipmentError;

      // Delete existing containers and re-insert
      await supabase.from("containers").delete().eq("shipment_id", id);

      const containerRows = containers.map((c, i) => ({
        shipment_id: id,
        sequence_number: i + 1,
        container_number: c.container_number,
        seal_number: c.seal_number || null,
        container_size: c.container_size,
        gross_weight_mt: parseFloat(c.gross_weight_mt),
        tare_weight_mt: parseFloat(c.tare_weight_mt),
      }));

      const { error: containerError } = await supabase
        .from("containers")
        .insert(containerRows);

      if (containerError) throw containerError;

      toast.success("Shipment updated");
      router.push(`/shipments/${id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update shipment"
      );
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/shipments/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Edit {invoiceNumber}</h2>
          <p className="text-muted-foreground">Update shipment details</p>
        </div>
      </div>

      {/* Seller & Buyer */}
      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Seller</Label>
              <Select value={sellerId} onValueChange={setSellerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select seller" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Buyer</Label>
              <Select value={buyerId} onValueChange={setBuyerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select buyer" />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Shipment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>B/L Number</Label>
            <Input
              value={blNumber}
              onChange={(e) => setBlNumber(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Vessel Name</Label>
              <Input
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Voyage Number</Label>
              <Input
                value={voyageNumber}
                onChange={(e) => setVoyageNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Port of Loading</Label>
              <Input
                value={portOfLoading}
                onChange={(e) => setPortOfLoading(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Port of Discharge</Label>
              <Input
                value={portOfDischarge}
                onChange={(e) => setPortOfDischarge(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Place of Receipt</Label>
              <Input
                value={placeOfReceipt}
                onChange={(e) => setPlaceOfReceipt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Final Destination</Label>
              <Input
                value={finalDestination}
                onChange={(e) => setFinalDestination(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sales Contract Ref</Label>
            <Input
              value={salesContractRef}
              onChange={(e) => setSalesContractRef(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cargo */}
      <Card>
        <CardHeader>
          <CardTitle>Cargo & Containers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Commodity</Label>
            <Select value={commodityId} onValueChange={setCommodityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                {commodities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label className="text-base">
              Containers ({containers.length})
            </Label>
            <Button variant="outline" size="sm" onClick={addContainer}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          {containers.map((c, i) => (
            <div key={i} className="rounded-md border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Container {i + 1}</span>
                {containers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeContainer(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Container #"
                  value={c.container_number}
                  onChange={(e) =>
                    updateContainer(i, "container_number", e.target.value)
                  }
                />
                <Input
                  placeholder="Seal #"
                  value={c.seal_number}
                  onChange={(e) =>
                    updateContainer(i, "seal_number", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Gross (MT)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={c.gross_weight_mt}
                    onChange={(e) =>
                      updateContainer(i, "gross_weight_mt", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tare (MT)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={c.tare_weight_mt}
                    onChange={(e) =>
                      updateContainer(i, "tare_weight_mt", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Net (MT)</Label>
                  <Input
                    value={(
                      (parseFloat(c.gross_weight_mt) || 0) -
                      (parseFloat(c.tare_weight_mt) || 0)
                    ).toFixed(3)}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Rate per MT</Label>
              <Input
                type="number"
                step="0.01"
                value={ratPerMt}
                onChange={(e) => setRatPerMt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Incoterms</Label>
              <Select value={incoterms} onValueChange={setIncoterms}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CIF">CIF</SelectItem>
                  <SelectItem value="FOB">FOB</SelectItem>
                  <SelectItem value="CFR">CFR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Incoterms Destination</Label>
            <Input
              value={incotermsDestination}
              onChange={(e) => setIncotermsDestination(e.target.value)}
            />
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="flex justify-between font-semibold">
              <span>Total: {totalNet.toFixed(3)} MT x {rate.toFixed(2)}</span>
              <span>
                {currency}{" "}
                {totalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Advance Paid</Label>
              <Input
                type="number"
                step="0.01"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Freight per Container</Label>
              <Input
                type="number"
                step="0.01"
                value={freightPerContainer}
                onChange={(e) => setFreightPerContainer(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Payment Terms</Label>
            <Textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          <p className="text-sm font-medium text-muted-foreground">
            Cost Tracking (internal)
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Purchase Cost per MT</Label>
              <Input
                type="number"
                step="0.01"
                value={purchaseCostPerMt}
                onChange={(e) => setPurchaseCostPerMt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Other Costs (flat)</Label>
              <Input
                type="number"
                step="0.01"
                value={otherCosts}
                onChange={(e) => setOtherCosts(e.target.value)}
              />
            </div>
          </div>
          {(purchaseCost > 0 || otherCost > 0) && (
            <div className="rounded-md bg-muted p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Total Cost:</span>
                <span>
                  {currency}{" "}
                  {totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Profit:</span>
                <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                  {currency}{" "}
                  {profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  {" "}({margin.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href={`/shipments/${id}`}>Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
