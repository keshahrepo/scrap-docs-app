export type DocumentType =
  | "commercial-invoice"
  | "packing-list"
  | "certificate-of-origin"
  | "freight-certificate"
  | "no-war-material"
  | "form-6"
  | "form-9";

export interface DocumentMeta {
  type: DocumentType;
  label: string;
  format: "docx" | "xlsx";
  filename: (invoiceNumber: string) => string;
}

export const DOCUMENTS: DocumentMeta[] = [
  {
    type: "commercial-invoice",
    label: "Commercial Invoice",
    format: "xlsx",
    filename: (inv) => `Commercial_Invoice_${inv}.xlsx`,
  },
  {
    type: "packing-list",
    label: "Packing List",
    format: "docx",
    filename: (inv) => `Packing_List_${inv}.docx`,
  },
  {
    type: "certificate-of-origin",
    label: "Certificate of Origin",
    format: "docx",
    filename: (inv) => `Certificate_of_Origin_${inv}.docx`,
  },
  {
    type: "freight-certificate",
    label: "Freight Certificate",
    format: "docx",
    filename: (inv) => `Freight_Certificate_${inv}.docx`,
  },
  {
    type: "no-war-material",
    label: "No War Material Certificate",
    format: "docx",
    filename: (inv) => `No_War_Material_${inv}.docx`,
  },
  {
    type: "form-6",
    label: "Form 6 (Customs)",
    format: "docx",
    filename: (inv) => `Form_6_${inv}.docx`,
  },
  {
    type: "form-9",
    label: "Form 9 (Customs)",
    format: "xlsx",
    filename: (inv) => `Form_9_${inv}.xlsx`,
  },
];
