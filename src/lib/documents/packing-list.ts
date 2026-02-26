import { generateDocx } from "./generate-docx";
import type { TemplateData } from "./template-data";

export async function generatePackingList(
  data: TemplateData
): Promise<Buffer> {
  return generateDocx("packing-list.docx", data);
}
