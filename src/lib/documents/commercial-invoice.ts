import { generateXlsx } from "./generate-xlsx";
import type { TemplateData } from "./template-data";

export async function generateCommercialInvoice(
  data: TemplateData
): Promise<Buffer> {
  return generateXlsx("commercial-invoice.xlsx", (workbook) => {
    const sheet = workbook.getWorksheet(1);
    if (!sheet) return;

    // Seller info
    sheet.getCell("B3").value = data.seller_name;
    sheet.getCell("B4").value = data.seller_address;
    sheet.getCell("B5").value = `Tel.: ${data.seller_phone} Fax: ${data.seller_fax} Email:${data.seller_email}`;

    // Invoice number and date
    sheet.getCell("I3").value = data.invoice_number_year;
    sheet.getCell("K3").value = data.invoice_date;

    // Sales contract ref
    sheet.getCell("I6").value = data.sales_contract_ref;

    // Buyer
    sheet.getCell("I8").value = `${data.buyer_name}\n${data.buyer_address}\nGST NO: ${data.buyer_gst}\nPAN NO: ${data.buyer_pan}\nIE CODE: ${data.buyer_ie_code}\nEMAIL: ${data.buyer_email}`;

    // Country
    sheet.getCell("I10").value = "USA";
    sheet.getCell("K10").value = "INDIA";

    // Bank details
    sheet.getCell("I11").value = `Bank Details: ${data.bank_details_full}`;

    // Pre-carriage
    sheet.getCell("F13").value = data.place_of_receipt;

    // Vessel
    sheet.getCell("B15").value = `${data.vessel_name} V. ${data.voyage_number}`;
    sheet.getCell("F15").value = data.port_of_loading;

    // Terms
    sheet.getCell("I15").value = data.payment_terms;

    // Ports
    sheet.getCell("B17").value = data.port_of_discharge;
    sheet.getCell("F17").value = data.final_destination;

    // Container details — add space after 4-char prefix (SUDU 7950051)
    const containerText = data.containers
      .map(
        (c) =>
          `${c.container_number.replace(/^([A-Z]{4})(\d)/, "$1 $2")}\nSEAL ${c.seal_number}`
      )
      .join("\n\n");
    sheet.getCell("B19").value = containerText;

    // Packing
    sheet.getCell("D19").value = `PACKED LOOSE IN`;
    sheet.getCell("D20").value = `${data.total_containers}`;
    sheet.getCell("E20").value = `x 20 FEET`;
    sheet.getCell("D21").value = `CONTAINERS`;

    // Description
    sheet.getCell("G19").value = data.commodity_upper;
    sheet.getCell("G22").value = `HS CODE: ${data.hs_code}`;

    // Quantities
    sheet.getCell("J19").value = Number(data.total_net_mt);
    sheet.getCell("K19").value = data.currency;
    sheet.getCell("L19").value = Number(data.rate_per_mt);
    sheet.getCell("M19").value = data.total_amount_raw;

    // Total
    sheet.getCell("K26").value = `Total ${data.currency}`;
    sheet.getCell("M26").value = data.total_amount_raw;

    // Amount in words
    sheet.getCell("B28").value = `(${data.amount_in_words})`;

    // Advance/balance — format numbers with commas
    if (Number(data.advance_paid) > 0) {
      const advanceFmt = Number(data.advance_paid).toLocaleString("en-US", {
        minimumFractionDigits: 2,
      });
      sheet.getCell("B30").value = `ADVANCE TT RECEIVED ${data.currency} ${advanceFmt} BALANCE PAYMENT OF ${data.currency} ${data.balance_due} DUE ON THIS INVOICE TO BE PAID AGAINST DELIVERY OF DOCUMENTS.`;
    }
  });
}
