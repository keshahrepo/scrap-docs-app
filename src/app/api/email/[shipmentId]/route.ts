import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildTemplateData } from "@/lib/documents/template-data";
import { generators } from "@/lib/documents/generate-all";
import { DOCUMENTS } from "@/types/document";
import type { ShipmentWithRelations } from "@/types/shipment";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "your_resend_api_key_here") {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(key);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  const { shipmentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const { to, subject, message } = body as {
    to: string[];
    subject?: string;
    message?: string;
  };

  if (!to || to.length === 0) {
    return new Response("No recipients specified", { status: 400 });
  }

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

    // Generate all documents
    const attachments = await Promise.all(
      DOCUMENTS.map(async (doc) => {
        const buffer = await generators[doc.type](templateData);
        return {
          filename: doc.filename(shipment.invoice_number),
          content: buffer,
        };
      })
    );

    const emailSubject =
      subject ||
      `Shipping Documents - Invoice ${shipment.invoice_number}`;
    const emailBody =
      message ||
      `Please find attached the shipping documents for Invoice ${shipment.invoice_number}.\n\nBest regards,\n${templateData.seller_name}`;

    await getResend().emails.send({
      from: `ScrapDocs <onboarding@resend.dev>`,
      to,
      subject: emailSubject,
      text: emailBody,
      attachments: attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return new Response(
      `Failed to send email: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
