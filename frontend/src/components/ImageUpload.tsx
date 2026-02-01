import { useRef } from "react";
import { Upload, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageUploadProps {
  image: string | null;
  onImageSelect: (image: string, file?: File) => void;
  onImageClear: () => void;
}

const ImageUpload = ({ image, onImageSelect, onImageClear }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect(e.target?.result as string, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="px-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <Card className="relative overflow-hidden border-2 border-dashed border-primary/20 bg-card shadow-card">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {image ? (
          <div className="relative">
            <img
              src={image}
              alt="Uploaded fish"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={onImageClear}
              className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur-sm rounded-full shadow-card hover:bg-card transition-colors"
              aria-label="Remove image"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div
            onClick={handleUploadClick}
            className="flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-primary/5 transition-colors"
          >
            <div className="p-4 bg-primary/10 rounded-2xl mb-4">
              <ImageIcon className="w-10 h-10 text-primary/60" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">
              Upload an image of the fish
            </p>
            <p className="text-sm text-muted-foreground">
              Tap to select from gallery
            </p>
          </div>
        )}
      </Card>

      {!image && (
        <Button
          variant="upload"
          size="lg"
          className="w-full mt-4"
          onClick={handleUploadClick}
        >
          <Upload className="w-5 h-5" />
          Upload Image
        </Button>
      )}
    </section>
  );
};

export default ImageUpload;
