import { createClient } from "@/lib/supabase/server";
import { buildTemplateData } from "@/lib/documents/template-data";
import { generateAllDocuments } from "@/lib/documents/generate-all";
import type { ShipmentWithRelations } from "@/types/shipment";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  const { shipmentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

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
    const zipBuffer = await generateAllDocuments(templateData);

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="Shipment_${shipment.invoice_number}.zip"`,
      },
    });
  } catch (err) {
    console.error("Document generation error:", err);
    return new Response(
      `Failed to generate documents: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
