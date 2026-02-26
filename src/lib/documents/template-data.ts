import type { ShipmentWithRelations } from "@/types/shipment";
import { amountInWords } from "@/lib/number-to-words";
import { format } from "date-fns";

export interface TemplateData {
  // Seller
  seller_name: string;
  seller_address: string;
  seller_contact: string;
  seller_phone: string;
  seller_fax: string;
  seller_email: string;
  bank_name: string;
  bank_account: string;
  bank_routing: string;
  bank_swift: string;
  bank_address: string;
  bank_details_full: string;

  // Buyer
  buyer_name: string;
  buyer_address: string;
  buyer_gst: string;
  buyer_pan: string;
  buyer_ie_code: string;
  buyer_email: string;

  // Invoice
  invoice_number: string;
  invoice_number_year: string;
  invoice_date: string;
  invoice_date_short: string;

  // Shipment
  bl_number: string;
  vessel_name: string;
  voyage_number: string;
  vessel_voyage: string;
  port_of_loading: string;
  port_of_discharge: string;
  final_destination: string;
  place_of_receipt: string;
  sales_contract_ref: string;

  // Commodity
  commodity_description: string;
  commodity_upper: string;
  commodity_title_case: string;
  hs_code: string;
  basel_no: string;
  packing_type: string;

  // Containers
  containers: Array<{
    seq: number;
    container_number: string;
    seal_number: string;
    gross_mt: string;
    tare_mt: string;
    net_mt: string;
    description: string;
  }>;

  // Totals
  total_containers: number;
  container_size: string;
  total_gross_mt: string;
  total_tare_mt: string;
  total_net_mt: string;
  total_net_kg: string;

  // Pricing
  rate_per_mt: string;
  currency: string;
  total_amount: string;
  total_amount_raw: number;
  amount_in_words: string;
  incoterms: string;
  incoterms_full: string;
  advance_paid: string;
  balance_due: string;
  freight_per_container: string;
  freight_per_container_rounded: string;
  total_freight: string;
  payment_terms: string;
  carrier_name: string;

  // Date
  current_date: string;
}

export function buildTemplateData(
  shipment: ShipmentWithRelations
): TemplateData {
  const s = shipment;
  const seller = s.seller;
  const buyer = s.buyer;
  const commodity = s.commodity;

  // Add space after 4-letter prefix in container numbers (SUDU7950051 → SUDU 7950051)
  const formatContainerNo = (num: string) =>
    num.replace(/^([A-Z]{4})(\d)/, "$1 $2");

  const containers = s.containers
    .sort((a, b) => a.sequence_number - b.sequence_number)
    .map((c) => ({
      seq: c.sequence_number,
      container_number: formatContainerNo(c.container_number),
      seal_number: c.seal_number || "",
      gross_mt: Number(c.gross_weight_mt).toFixed(3),
      tare_mt: Number(c.tare_weight_mt).toFixed(3),
      net_mt: Number(c.net_weight_mt).toFixed(3),
      description: commodity.description,
    }));

  const totalNet = Number(s.total_net_weight);
  const totalGross = Number(s.total_gross_weight);
  const totalTare = Number(s.total_tare_weight);
  const totalAmount = Number(s.total_amount);
  const freightPerContainer = Number(s.freight_per_container) || 0;

  const invoiceDate = new Date(s.invoice_date);
  const invoiceYear = invoiceDate.getFullYear();

  const bankDetailsFull = [
    seller.bank_name ? `Account No. ${seller.account_number} held at ${seller.bank_name}` : "",
    seller.bank_address || "",
    seller.routing_number ? `(Routing Number ${seller.routing_number})` : "",
    seller.swift_code ? `SWIFT CODE ${seller.swift_code}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    seller_name: seller.company_name,
    seller_address: seller.address,
    seller_contact: seller.contact_person || "",
    seller_phone: seller.phone || "",
    seller_fax: seller.fax || "",
    seller_email: seller.email || "",
    bank_name: seller.bank_name || "",
    bank_account: seller.account_number || "",
    bank_routing: seller.routing_number || "",
    bank_swift: seller.swift_code || "",
    bank_address: seller.bank_address || "",
    bank_details_full: bankDetailsFull,

    buyer_name: buyer.name,
    buyer_address: buyer.address,
    buyer_gst: buyer.gst_no || "",
    buyer_pan: buyer.pan_no || "",
    buyer_ie_code: buyer.ie_code || "",
    buyer_email: buyer.email || "",

    invoice_number: s.invoice_number,
    invoice_number_year: `${s.invoice_number}/${invoiceYear}`,
    invoice_date: format(invoiceDate, "MMMM d, yyyy"),
    invoice_date_short: format(invoiceDate, "dd/MMM/yyyy").toUpperCase(),

    bl_number: s.bl_number || "",
    vessel_name: s.vessel_name || "",
    voyage_number: s.voyage_number || "",
    vessel_voyage: [s.vessel_name, s.voyage_number ? `V. ${s.voyage_number}` : ""]
      .filter(Boolean)
      .join(" "),
    port_of_loading: s.port_of_loading || "",
    port_of_discharge: s.port_of_discharge || "",
    final_destination: s.final_destination || "",
    place_of_receipt: s.place_of_receipt || "",
    sales_contract_ref: s.sales_contract_ref || "",

    commodity_description: commodity.description,
    commodity_upper: commodity.description.toUpperCase(),
    commodity_title_case: commodity.description
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" "),
    hs_code: commodity.hs_code,
    basel_no: commodity.basel_no,
    packing_type: commodity.packing_type || "LOOSE IN CONTAINER",

    containers,

    total_containers: s.total_containers,
    container_size: containers[0]?.container_number ? "20" : "20",
    total_gross_mt: totalGross.toFixed(3),
    total_tare_mt: totalTare.toFixed(3),
    total_net_mt: totalNet.toFixed(3),
    total_net_kg: (totalNet * 1000).toLocaleString("en-US"),

    rate_per_mt: Number(s.rate_per_mt).toFixed(2),
    currency: s.currency,
    total_amount: totalAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    total_amount_raw: totalAmount,
    amount_in_words: totalAmount > 0 ? amountInWords(totalAmount) : "",
    incoterms: s.incoterms,
    incoterms_full: [s.incoterms, s.incoterms_destination]
      .filter(Boolean)
      .join(" "),
    advance_paid: Number(s.advance_paid).toFixed(2),
    balance_due: Number(s.balance_due).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    freight_per_container: freightPerContainer.toFixed(2),
    freight_per_container_rounded: Math.round(freightPerContainer).toString(),
    total_freight: (freightPerContainer * s.total_containers).toFixed(2),
    payment_terms: s.payment_terms || "",
    // Carrier name: extract line name from vessel (e.g. "MAERSK DETROIT" → "MAERSK LINE")
    carrier_name: s.vessel_name
      ? s.vessel_name.split(" ")[0] + " LINE"
      : "",

    current_date: format(new Date(), "dd/MMM/yyyy").toUpperCase(),
  };
}
