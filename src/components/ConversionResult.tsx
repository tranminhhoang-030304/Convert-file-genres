
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { ConversionType } from "@/pages/Index";

interface ConversionResultProps {
  isConverting: boolean;
  convertedFileUrl: string | null;
  error: string | null;
  onConvert: () => void;
  onReset: () => void;
  hasFile: boolean;
  conversionType: ConversionType;
}

export const ConversionResult = ({
  isConverting,
  convertedFileUrl,
  error,
  onConvert,
  onReset,
  hasFile,
  conversionType,
}: ConversionResultProps) => {
  if (isConverting) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div className="text-center w-full max-w-md">
            <p className="text-lg font-medium text-foreground mb-2">
              Converting your document...
            </p>
            <Progress value={66} className="h-2" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-destructive/50 bg-destructive/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-1">
              Conversion Failed
            </p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={onReset} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (convertedFileUrl) {
    const outputFormat = conversionType === "docx-to-pdf" ? "PDF" : "DOCX";
    
    return (
      <Card className="p-8 border-[hsl(var(--success))]/50 bg-[hsl(var(--success))]/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[hsl(var(--success))]" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-1">
              Conversion Complete!
            </p>
            <p className="text-sm text-muted-foreground">
              Your {outputFormat} file is ready to download
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                const a = document.createElement("a");
                a.href = convertedFileUrl;
                a.download = `converted.${outputFormat.toLowerCase()}`;
                a.click();
              }}
              className="gradient-success text-success-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Download {outputFormat}
            </Button>
            <Button onClick={onReset} variant="outline">
              Convert Another
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (hasFile) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4">
          <Button onClick={onConvert} size="lg" className="gradient-primary">
            Convert Now
          </Button>
        </div>
      </Card>
    );
  }

  return null;
};
