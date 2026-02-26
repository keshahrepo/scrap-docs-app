import { generateDocx } from "./generate-docx";
import type { TemplateData } from "./template-data";

export async function generateNoWarMaterial(
  data: TemplateData
): Promise<Buffer> {
  return generateDocx("no-war-material.docx", data);
}
