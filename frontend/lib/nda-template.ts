export interface TemplateField {
  id: string;
  label: string;
  type: "text" | "textarea" | "date" | "number";
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export const NDA_FIELDS: TemplateField[] = [
  {
    id: "party1_name",
    label: "Party 1 Full Legal Name",
    type: "text",
    required: true,
    placeholder: "Acme Corporation",
  },
  {
    id: "party1_address",
    label: "Party 1 Address",
    type: "textarea",
    required: true,
    placeholder: "123 Main St, San Francisco, CA 94105",
  },
  {
    id: "party2_name",
    label: "Party 2 Full Legal Name",
    type: "text",
    required: true,
    placeholder: "Beta LLC",
  },
  {
    id: "party2_address",
    label: "Party 2 Address",
    type: "textarea",
    required: true,
    placeholder: "456 Market St, New York, NY 10001",
  },
  {
    id: "effective_date",
    label: "Effective Date",
    type: "date",
    required: true,
  },
  {
    id: "purpose",
    label: "Purpose of Disclosure",
    type: "textarea",
    required: true,
    placeholder: "Evaluating a potential business partnership between the parties",
  },
  {
    id: "term_years",
    label: "Agreement Term (years)",
    type: "number",
    required: true,
    placeholder: "2",
    defaultValue: "2",
  },
  {
    id: "governing_law_state",
    label: "Governing Law (State)",
    type: "text",
    required: true,
    placeholder: "California",
  },
];

export const NDA_CONTENT = `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (this "Agreement") is entered into as of {{effective_date}} (the "Effective Date") by and between:

{{party1_name}}, located at {{party1_address}} ("Party 1"); and

{{party2_name}}, located at {{party2_address}} ("Party 2").

Party 1 and Party 2 are each referred to herein as a "Party" and collectively as the "Parties."

1. PURPOSE

The Parties wish to explore {{purpose}} (the "Purpose") and, in connection with the Purpose, each Party may disclose to the other certain confidential and proprietary information.

2. CONFIDENTIAL INFORMATION

"Confidential Information" means any information or data disclosed by either Party that is marked as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure, including but not limited to technical data, trade secrets, know-how, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances or other business information.

Confidential Information does not include information that: (a) is or becomes publicly known through no breach of this Agreement by the receiving Party; (b) was rightfully known by the receiving Party prior to disclosure by the disclosing Party; (c) is received from a third party without restriction on disclosure; or (d) was independently developed by the receiving Party without use of Confidential Information.

3. OBLIGATIONS

Each Party agrees: (a) to hold the other Party's Confidential Information in strict confidence using no less than reasonable care; (b) not to disclose such Confidential Information to any third party without the prior written consent of the disclosing Party; (c) to use such Confidential Information solely for the Purpose; and (d) to limit access to such Confidential Information to those of its employees and contractors who have a need to know and who are bound by confidentiality obligations at least as protective as those in this Agreement.

4. TERM

This Agreement commences on the Effective Date and continues for {{term_years}} year(s) unless earlier terminated by either Party upon thirty (30) days' written notice to the other Party. Each Party's obligations with respect to Confidential Information disclosed during the term of this Agreement survive for two (2) years after the expiration or termination of this Agreement.

5. RETURN OR DESTRUCTION OF INFORMATION

Upon the written request of the disclosing Party, the receiving Party shall promptly return or certify destruction of all Confidential Information and any copies thereof.

6. NO LICENSE

Nothing in this Agreement grants either Party any rights in or to the other Party's Confidential Information except as expressly set forth herein. Each Party retains all right, title, and interest in and to its own Confidential Information.

7. GOVERNING LAW

This Agreement is governed by the laws of the State of {{governing_law_state}}, without regard to its conflict of laws provisions.

8. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the Parties with respect to its subject matter and supersedes all prior and contemporaneous agreements, understandings, negotiations and discussions, whether oral or written.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

{{party1_name}}

Signature: _______________________________
Name: ___________________________________
Title: ____________________________________
Date: ____________________________________

{{party2_name}}

Signature: _______________________________
Name: ___________________________________
Title: ____________________________________
Date: ____________________________________
`;

export function getDefaultValues(): Record<string, string> {
  return Object.fromEntries(
    NDA_FIELDS.map((f) => [f.id, f.defaultValue ?? ""])
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderTemplateHTML(values: Record<string, string>): string {
  const escapedTemplate = NDA_CONTENT.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escapedTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = values[key]?.trim();
    if (val) {
      return `<span class="filled-value">${escapeHtml(val)}</span>`;
    }
    const label = NDA_FIELDS.find((f) => f.id === key)?.label ?? key;
    return `<span class="empty-placeholder">[${label}]</span>`;
  });
}

export function renderTemplatePlain(values: Record<string, string>): string {
  return NDA_CONTENT.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = values[key]?.trim();
    if (val) return val;
    const label = NDA_FIELDS.find((f) => f.id === key)?.label ?? key;
    return `[${label}]`;
  });
}
