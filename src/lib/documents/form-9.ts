import { generateXlsx } from "./generate-xlsx";
import type { TemplateData } from "./template-data";

export async function generateForm9(data: TemplateData): Promise<Buffer> {
  return generateXlsx("form-9.xlsx", (workbook) => {
    const sheet = workbook.getWorksheet(1);
    if (!sheet) return;

    // Exporter
    sheet.getCell("J6").value = `${data.seller_name}\n${data.seller_address}`;
    // Waste generator
    sheet.getCell("J10").value = "SAME AS ABOVE";
    // Site of generation
    sheet.getCell("J12").value = data.place_of_receipt || data.port_of_loading;

    // Importer
    sheet.getCell("J13").value = `${data.buyer_name}\n${data.buyer_address}\nGST NO: ${data.buyer_gst}\nPAN NO: ${data.buyer_pan}\nIE CODE: ${data.buyer_ie_code}\nEMAIL: ${data.buyer_email}`;

    // B/L
    sheet.getCell("J19").value = `B/L NO.- ${data.bl_number}`;
    // Description
    sheet.getCell("J20").value = data.commodity_upper;
    // Physical characteristic
    sheet.getCell("J21").value = "NO.2 (I.E SOLIDS)";
    // Quantity
    sheet.getCell("J22").value = `${data.total_net_kg} KGS`;

    // Waste ID codes
    sheet.getCell("J24").value = data.basel_no;
    sheet.getCell("J28").value = data.hs_code;
    sheet.getCell("J29").value = data.hs_code;

    // OECD classification
    sheet.getCell("J31").value = "GREEN LIST";
    // Packaging
    sheet.getCell("J33").value = "LOOSE IN CONTAINERS";

    // UN shipping name (carrier, not vessel)
    sheet.getCell("J36").value = data.carrier_name;

    // Declaration date
    sheet.getCell("C44").value = `Date: ${data.invoice_date_short}`;
    sheet.getCell("C45").value = `Name: ${data.seller_contact}`;
  });
}
