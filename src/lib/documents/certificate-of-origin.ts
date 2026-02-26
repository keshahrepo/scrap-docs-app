import { generateDocx } from "./generate-docx";
import type { TemplateData } from "./template-data";

export async function generateCertificateOfOrigin(
  data: TemplateData
): Promise<Buffer> {
  return generateDocx("certificate-of-origin.docx", data);
}
