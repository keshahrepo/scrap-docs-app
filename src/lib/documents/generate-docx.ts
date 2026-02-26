import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { readFileSync } from "fs";
import { join } from "path";

export async function generateDocx(
  templateName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): Promise<Buffer> {
  const templatePath = join(process.cwd(), "templates", templateName);
  const templateContent = readFileSync(templatePath, "binary");
  const zip = new PizZip(templateContent);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(data);

  const buffer = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return buffer;
}
