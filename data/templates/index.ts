import mutualNda from "./mutual-nda.json";
import serviceAgreement from "./service-agreement.json";
import employmentContract from "./employment-contract.json";

export type FieldType = "text" | "textarea" | "date" | "number" | "select";

export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
}

export interface LegalTemplate {
  id: string;
  name: string;
  shortName: string;
  description: string;
  version: string;
  source?: string;
  category: "confidentiality" | "commercial" | "employment";
  fields: TemplateField[];
  content: string;
}

export const templates: LegalTemplate[] = [
  mutualNda as LegalTemplate,
  serviceAgreement as LegalTemplate,
  employmentContract as LegalTemplate,
];

export function getTemplateById(id: string): LegalTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function renderTemplate(
  template: LegalTemplate,
  values: Record<string, string>
): string {
  return template.content.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`);
}
