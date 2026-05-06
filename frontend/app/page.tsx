"use client";

import { useState, useCallback } from "react";
import {
  NDA_FIELDS,
  getDefaultValues,
  renderTemplateHTML,
  renderTemplatePlain,
  type TemplateField,
} from "@/lib/nda-template";

export default function NDACreator() {
  const [values, setValues] = useState<Record<string, string>>(
    getDefaultValues()
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = useCallback((id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const filledCount = NDA_FIELDS.filter((f) => values[f.id]?.trim()).length;
  const allFilled = filledCount === NDA_FIELDS.length;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      const marginL = 25;
      const marginR = 25;
      const marginT = 30;
      const marginB = 25;
      const pageWidth = 210;
      const pageHeight = 297;
      const contentWidth = pageWidth - marginL - marginR;

      let y = marginT;

      const addPageIfNeeded = (needed: number) => {
        if (y + needed > pageHeight - marginB) {
          doc.addPage();
          y = marginT;
        }
      };

      const plainContent = renderTemplatePlain(values);
      const paragraphs = plainContent.split("\n\n");

      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;

        const lines = trimmed.split("\n");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const isSectionHeading =
            /^\d+\./.test(line) || line === line.toUpperCase();
          const isTitle = i === 0 && para === paragraphs[0];

          if (isTitle) {
            doc.setFont("times", "bold");
            doc.setFontSize(13);
            const w = doc.getTextWidth(line);
            addPageIfNeeded(12);
            doc.text(line, (pageWidth - w) / 2, y);
            y += 10;
          } else if (isSectionHeading && line.length < 60) {
            doc.setFont("times", "bold");
            doc.setFontSize(11);
            addPageIfNeeded(8);
            doc.text(line, marginL, y);
            y += 7;
          } else {
            doc.setFont("times", "normal");
            doc.setFontSize(10.5);
            const wrapped = doc.splitTextToSize(line, contentWidth);
            const blockH = wrapped.length * 5.5;
            addPageIfNeeded(blockH);
            doc.text(wrapped, marginL, y);
            y += blockH;
          }
        }

        y += 4;
      }

      const party1 = values.party1_name?.trim() || "party1";
      const party2 = values.party2_name?.trim() || "party2";
      const filename = `mutual-nda-${party1}-${party2}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60);

      doc.save(`${filename}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const previewHTML = renderTemplateHTML(values);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-[#1e3050] bg-[#0b1629] z-10">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-semibold text-white tracking-tight leading-none">
            pre<span className="text-gold">legal</span>
          </span>
          <span className="hidden sm:block text-[#3a5070] text-xs font-body uppercase tracking-widest mt-0.5">
            /
          </span>
          <span className="hidden sm:block text-storm text-xs font-body uppercase tracking-widest mt-0.5">
            Mutual NDA Creator
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {NDA_FIELDS.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-4 rounded-full transition-colors duration-300 ${
                  i < filledCount ? "bg-gold" : "bg-[#1e3050]"
                }`}
              />
            ))}
          </div>
          <span className="text-storm text-xs font-body ml-2">
            {filledCount}/{NDA_FIELDS.length}
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Form Panel */}
        <aside className="w-[400px] flex-shrink-0 bg-[#0b1629] dot-grid flex flex-col border-r border-[#1e3050]">
          <div className="flex-1 overflow-y-auto scrollbar-dark px-6 py-6 space-y-5 animate-fade-in">
            <div className="mb-6">
              <h1 className="font-display text-xl font-semibold text-white leading-snug">
                Mutual Non&#8209;Disclosure Agreement
              </h1>
              <p className="text-storm text-xs font-body mt-1 leading-relaxed">
                Based on Common Paper MNDA v1.0 · CC BY 4.0
              </p>
            </div>

            {NDA_FIELDS.map((field, idx) => (
              <FormField
                key={field.id}
                field={field}
                value={values[field.id]}
                onChange={handleChange}
                animDelay={idx * 40}
              />
            ))}
          </div>

          {/* Download button pinned at bottom */}
          <div className="flex-shrink-0 p-6 border-t border-[#1e3050] bg-[#0b1629]">
            <button
              className="btn-gold"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              title={
                !allFilled ? "Fill all fields for a complete document" : ""
              }
            >
              {isGenerating ? (
                <>
                  <Spinner />
                  Generating PDF…
                </>
              ) : (
                <>
                  <DownloadIcon />
                  Download PDF
                </>
              )}
            </button>
            {!allFilled && (
              <p className="text-center text-[10px] text-storm mt-2 font-body">
                {NDA_FIELDS.length - filledCount} field
                {NDA_FIELDS.length - filledCount !== 1 ? "s" : ""} remaining —
                placeholders will appear in the PDF
              </p>
            )}
          </div>
        </aside>

        {/* Preview Panel */}
        <main className="flex-1 bg-parchment overflow-y-auto scrollbar-light">
          <div className="min-h-full px-10 py-10 flex justify-center">
            <div className="w-full max-w-[680px]">
              {/* Paper document */}
              <div className="bg-white paper-shadow rounded-sm px-14 py-16 animate-fade-in">
                <div
                  className="nda-content"
                  dangerouslySetInnerHTML={{ __html: previewHTML }}
                />
              </div>

              {/* Footer note */}
              <p className="text-center text-ink-light text-[10px] font-body mt-6 opacity-60">
                This document is a prototype generated by prelegal. It is not
                legal advice. Please consult a licensed attorney before signing.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FormField({
  field,
  value,
  onChange,
  animDelay,
}: {
  field: TemplateField;
  value: string;
  onChange: (id: string, val: string) => void;
  animDelay: number;
}) {
  const isFilled = value.trim().length > 0;

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${animDelay}ms` }}
    >
      <label className="block mb-1.5">
        <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-storm">
          {field.label}
          {field.required && (
            <span className="text-gold ml-1">*</span>
          )}
        </span>
        {isFilled && (
          <span className="float-right text-[10px] text-gold font-body">✓</span>
        )}
      </label>

      {field.type === "textarea" ? (
        <textarea
          className="input-field"
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.id, e.target.value)}
          rows={3}
        />
      ) : (
        <input
          type={field.type}
          className="input-field"
          value={value}
          placeholder={field.placeholder}
          min={field.type === "number" ? 1 : undefined}
          max={field.type === "number" ? 99 : undefined}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
