import { generateDocx } from "./generate-docx";
import type { TemplateData } from "./template-data";

export async function generateFreightCertificate(
  data: TemplateData
): Promise<Buffer> {
  return generateDocx("freight-certificate.docx", data);
}
