
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ConversionOptions } from "@/components/ConversionOptions";
import { ConversionResult } from "@/components/ConversionResult";
import { FileText, ArrowRightLeft } from "lucide-react";

export type ConversionType = "docx-to-pdf" | "pdf-to-docx";

export interface ConversionState {
  file: File | null;
  conversionType: ConversionType;
  isConverting: boolean;
  convertedFileUrl: string | null;
  error: string | null;
}

const Index = () => {
  const [state, setState] = useState<ConversionState>({
    file: null,
    conversionType: "docx-to-pdf",
    isConverting: false,
    convertedFileUrl: null,
    error: null,
  });

  const handleFileSelect = (file: File) => {
    setState((prev) => ({
      ...prev,
      file,
      convertedFileUrl: null,
      error: null,
    }));
  };

  const handleConversionTypeChange = (type: ConversionType) => {
    setState((prev) => ({
      ...prev,
      conversionType: type,
      file: null,
      convertedFileUrl: null,
      error: null,
    }));
  };

  const handleConvert = async (forceOcr = false) => {
  if (!state.file) return;

  setState((prev) => ({ ...prev, isConverting: true, error: null }));

  try {
    const form = new FormData();
    form.append("file", state.file as Blob, state.file!.name);
    form.append("conversionType", state.conversionType);

    const resp = await fetch(
      `http://localhost:3001/convert${forceOcr ? "?forceOcr=true" : ""}`,
      {
        method: "POST",
        body: form,
      }
    );

    const contentType = resp.headers.get("content-type");

    // ===== Nếu backend trả JSON =====
    if (contentType && contentType.includes("application/json")) {
      const data = await resp.json();

      if (data.needOcr) {
        setState((prev) => ({ ...prev, isConverting: false }));

        const confirmOcr = window.confirm(data.message);

        if (confirmOcr) {
          // Gọi lại API với forceOcr=true
          return handleConvert(true);
        }

        return;
      }

      throw new Error(data.message || "Conversion failed");
    }

    // ===== Nếu backend trả file =====
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);

    setState((prev) => ({
      ...prev,
      isConverting: false,
      convertedFileUrl: url,
    }));
  } catch (error) {
    console.error(error);
    setState((prev) => ({
      ...prev,
      isConverting: false,
      error: "Conversion failed. Please try again.",
    }));
  }
};

  const handleReset = () => {
    setState({
      file: null,
      conversionType: state.conversionType,
      isConverting: false,
      convertedFileUrl: null,
      error: null,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <ArrowRightLeft className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">DocConverter</h1>
              <p className="text-sm text-muted-foreground">Convert documents instantly</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            <span>Fast & Secure Document Conversion</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Convert DOCX to PDF and PDF to DOCX
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Transform your documents between formats in seconds. No registration required, completely free.
          </p>

          {/* Conversion Options */}
          <ConversionOptions
            conversionType={state.conversionType}
            onConversionTypeChange={handleConversionTypeChange}
          />

          {/* File Upload */}
          <div className="mt-8">
            <FileUpload
              onFileSelect={handleFileSelect}
              conversionType={state.conversionType}
              selectedFile={state.file}
            />
          </div>

          {/* Conversion Result */}
          {(state.isConverting || state.convertedFileUrl || state.error || state.file) && (
            <div className="mt-8">
              <ConversionResult
                isConverting={state.isConverting}
                convertedFileUrl={state.convertedFileUrl}
                error={state.error}
                onConvert={handleConvert}
                onReset={handleReset}
                hasFile={!!state.file}
                conversionType={state.conversionType}
              />
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">High Quality</h3>
              <p className="text-muted-foreground">
                Preserve formatting, fonts, and layout during conversion
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeft className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Bidirectional</h3>
              <p className="text-muted-foreground">
                Convert DOCX to PDF or PDF to DOCX with ease
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Fast & Secure</h3>
              <p className="text-muted-foreground">
                Quick conversion with secure file handling
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 DocConverter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

    export default Index;