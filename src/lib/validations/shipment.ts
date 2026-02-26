import { z } from "zod";

export const containerSchema = z.object({
  container_number: z.string().min(1, "Container number is required"),
  seal_number: z.string().optional().default(""),
  container_size: z.string().default("20"),
  gross_weight_mt: z.coerce.number().positive("Gross weight must be positive"),
  tare_weight_mt: z.coerce.number().positive("Tare weight must be positive"),
});

export const shipmentSchema = z.object({
  seller_id: z.string().min(1, "Seller is required"),
  buyer_id: z.string().min(1, "Buyer is required"),
  commodity_id: z.string().min(1, "Commodity is required"),

  invoice_number: z.string().min(1, "Invoice number is required"),
  invoice_date: z.string().min(1, "Invoice date is required"),

  bl_number: z.string().optional().default(""),
  vessel_name: z.string().optional().default(""),
  voyage_number: z.string().optional().default(""),
  port_of_loading: z.string().optional().default("NORFOLK, VA"),
  port_of_discharge: z.string().optional().default(""),
  final_destination: z.string().optional().default(""),
  place_of_receipt: z.string().optional().default(""),
  sales_contract_ref: z.string().optional().default(""),

  rate_per_mt: z.coerce.number().positive("Rate must be positive"),
  currency: z.string().default("USD"),
  incoterms: z.string().default("CIF"),
  incoterms_destination: z.string().optional().default(""),
  advance_paid: z.coerce.number().min(0).default(0),
  freight_per_container: z.coerce.number().min(0).optional(),
  payment_terms: z.string().optional().default(""),
  purchase_cost_per_mt: z.coerce.number().min(0).default(0),
  other_costs: z.coerce.number().min(0).default(0),

  containers: z
    .array(containerSchema)
    .min(1, "At least one container is required"),
});

export type ShipmentFormValues = z.infer<typeof shipmentSchema>;
