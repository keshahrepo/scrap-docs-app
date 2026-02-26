import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildTemplateData } from "@/lib/documents/template-data";
import { generators } from "@/lib/documents/generate-all";
import { DOCUMENTS } from "@/types/document";
import type { DocumentType } from "@/types/document";
import type { ShipmentWithRelations } from "@/types/shipment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  const { shipmentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const type = request.nextUrl.searchParams.get("type") as DocumentType;
  if (!type) return new Response("Missing type parameter", { status: 400 });

  const docMeta = DOCUMENTS.find((d) => d.type === type);
  if (!docMeta)
    return new Response("Invalid document type", { status: 400 });

  const generator = generators[type];
  if (!generator)
    return new Response("Generator not found", { status: 400 });

  const { data: shipment, error } = await supabase
    .from("shipments")
    .select(
      "*, seller:sellers(*), buyer:buyers(*), commodity:commodities(*), containers(*)"
    )
    .eq("id", shipmentId)
    .single();

  if (error || !shipment) {
    return new Response("Shipment not found", { status: 404 });
  }

  try {
    const templateData = buildTemplateData(
      shipment as unknown as ShipmentWithRelations
    );
    const buffer = await generator(templateData);
    const filename = docMeta.filename(shipment.invoice_number);

    const contentType =
      docMeta.format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Document generation error:", err);
    return new Response(
      `Failed to generate document: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
