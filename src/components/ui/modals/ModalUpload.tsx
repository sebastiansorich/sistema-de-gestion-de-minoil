import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../base/dialog";
import { Button } from "../base/button";
import { Upload, FileText, AlertCircle } from 'lucide-react'

interface ModalUploadProps {
  open: boolean;
  onClose: () => void;
  onFile: (file: File) => void;
}

export function ModalUpload({ open, onClose, onFile }: ModalUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConfirm = () => {
    if (file) onFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importar archivo Excel</DialogTitle>
        </DialogHeader>
        <div
          className="border-2 border-dashed border-primary rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-muted hover:bg-primary/10 transition"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-primary mb-2" />
          <span className="font-secondary text-base mb-2">Arrastra tu archivo aquí o haz click para seleccionarlo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
          {file && <span className="mt-2 text-sm text-primary font-medium">{file.name}</span>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!file} className="bg-primary text-white">Subir archivo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 