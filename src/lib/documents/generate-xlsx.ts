import ExcelJS from "exceljs";
import { join } from "path";

export async function generateXlsx(
  templateName: string,
  populateFn: (workbook: ExcelJS.Workbook) => void
): Promise<Buffer> {
  const templatePath = join(process.cwd(), "templates", templateName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);

  populateFn(workbook);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
