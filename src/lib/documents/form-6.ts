import { generateDocx } from "./generate-docx";
import type { TemplateData } from "./template-data";

export async function generateForm6(data: TemplateData): Promise<Buffer> {
  return generateDocx("form-6.docx", data);
}
