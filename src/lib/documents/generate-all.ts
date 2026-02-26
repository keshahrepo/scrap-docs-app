import JSZip from "jszip";
import { DOCUMENTS } from "@/types/document";
import type { TemplateData } from "./template-data";
import type { DocumentType } from "@/types/document";
import { generateCommercialInvoice } from "./commercial-invoice";
import { generatePackingList } from "./packing-list";
import { generateCertificateOfOrigin } from "./certificate-of-origin";
import { generateFreightCertificate } from "./freight-certificate";
import { generateNoWarMaterial } from "./no-war-material";
import { generateForm6 } from "./form-6";
import { generateForm9 } from "./form-9";

const generators: Record<
  DocumentType,
  (data: TemplateData) => Promise<Buffer>
> = {
  "commercial-invoice": generateCommercialInvoice,
  "packing-list": generatePackingList,
  "certificate-of-origin": generateCertificateOfOrigin,
  "freight-certificate": generateFreightCertificate,
  "no-war-material": generateNoWarMaterial,
  "form-6": generateForm6,
  "form-9": generateForm9,
};

export { generators };

export async function generateAllDocuments(
  data: TemplateData
): Promise<Buffer> {
  const zip = new JSZip();
  const invoiceNum = data.invoice_number;

  const results = await Promise.all(
    DOCUMENTS.map(async (doc) => {
      const buffer = await generators[doc.type](data);
      return { filename: doc.filename(invoiceNum), buffer };
    })
  );

  results.forEach(({ filename, buffer }) => {
    zip.file(filename, buffer);
  });

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return zipBuffer;
}
