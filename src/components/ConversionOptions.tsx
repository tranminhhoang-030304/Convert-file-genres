
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, File } from "lucide-react";
import { ConversionType } from "@/pages/Index";

interface ConversionOptionsProps {
  conversionType: ConversionType;
  onConversionTypeChange: (type: ConversionType) => void;
}

export const ConversionOptions = ({
  conversionType,
  onConversionTypeChange,
}: ConversionOptionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Card
        className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
          conversionType === "docx-to-pdf"
            ? "ring-2 ring-primary shadow-lg"
            : "hover:border-primary/50"
        }`}
        onClick={() => onConversionTypeChange("docx-to-pdf")}
      >
        <div className="flex flex-col items-center gap-3 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--docx-color))]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[hsl(var(--docx-color))]" />
            </div>
            <span className="text-2xl text-muted-foreground">→</span>
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--pdf-color))]/10 flex items-center justify-center">
              <File className="w-5 h-5 text-[hsl(var(--pdf-color))]" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground">DOCX to PDF</h3>
            <p className="text-sm text-muted-foreground">Convert Word to PDF</p>
          </div>
        </div>
      </Card>

      <Card
        className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
          conversionType === "pdf-to-docx"
            ? "ring-2 ring-primary shadow-lg"
            : "hover:border-primary/50"
        }`}
        onClick={() => onConversionTypeChange("pdf-to-docx")}
      >
        <div className="flex flex-col items-center gap-3 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--pdf-color))]/10 flex items-center justify-center">
              <File className="w-5 h-5 text-[hsl(var(--pdf-color))]" />
            </div>
            <span className="text-2xl text-muted-foreground">→</span>
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--docx-color))]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[hsl(var(--docx-color))]" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground">PDF to DOCX</h3>
            <p className="text-sm text-muted-foreground">Convert PDF to Word</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
