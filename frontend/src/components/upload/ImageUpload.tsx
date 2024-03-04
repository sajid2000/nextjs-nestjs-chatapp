"use client";

import { X } from "lucide-react";
import Image from "next/image";

import { UploadDropzone, UploadedFile } from "@/lib/uploadthing";

import { Button } from "../ui/button";

type Props = {
  endpoint: "avatar" | "groupImage";
  onUpload: (url?: string) => void;
  value?: string;
};

const ImageUpload = ({ onUpload, value, endpoint }: Props) => {
  if (value) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative size-40">
          <Image src={value} alt="uploaded image" className="object-contain" fill />
        </div>
        <Button onClick={() => onUpload("")} variant="ghost" type="button">
          <X className="size-4" />
          Remove
        </Button>
      </div>
    );
  }
  return (
    <div className="size-full bg-muted/30">
      <UploadDropzone
        // @ts-ignore
        endpoint={endpoint}
        onClientUploadComplete={(res: Array<UploadedFile>) => {
          onUpload(res?.[0]?.url);
        }}
        onUploadError={(error: Error) => {
          console.log(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
};

export default ImageUpload;
