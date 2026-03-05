
import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Upload, FileText, File, X } from "lucide-react";
import { ConversionType } from "@/pages/Index";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  conversionType: ConversionType;
  selectedFile: File | null;
}

export const FileUpload = ({
  onFileSelect,
  conversionType,
  selectedFile,
}: FileUploadProps) => {
  const acceptedFormats =
    conversionType === "docx-to-pdf"
      ? ".docx,.doc"
      : ".pdf";

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = () => {
    if (conversionType === "docx-to-pdf") {
      return <FileText className="w-8 h-8 text-[hsl(var(--docx-color))]" />;
    }
    return <File className="w-8 h-8 text-[hsl(var(--pdf-color))]" />;
  };

  if (selectedFile) {
    return (
      <Card className="p-8 border-2 border-dashed border-primary/50 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center">
              {getFileIcon()}
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFileSelect(null as any)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="p-12 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-medium text-foreground mb-1">
            Drop your file here or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Accepted formats: {acceptedFormats.replace(/\./g, "").toUpperCase()}
          </p>
        </div>
        <input
          id="file-input"
          type="file"
          accept={acceptedFormats}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
      </Card>
    );
  };
