"use client";

import { FileIcon, X } from "lucide-react";
import Image from "next/image";

import { UploadDropzone, UploadedFile } from "@/lib/uploadthing";

import { Button } from "../ui/button";

type Props = {
  endpoint: "avatar";
  onUpload: (url?: string) => void;
  value?: string;
};

const FileUpload = ({ onUpload, value, endpoint }: Props) => {
  const type = value?.split(".").pop();

  if (value) {
    return (
      <div className="flex flex-col items-center justify-center">
        {type === "image" ? (
          <div className="relative size-40">
            <Image src={value} alt="uploaded image" className="object-contain" fill />
          </div>
        ) : (
          <div className="relative mt-2 flex items-center rounded-md bg-background/10 p-2">
            <FileIcon />
            <a
              href={value}
              target="_blank"
              rel="noopener_noreferrer"
              className="ml-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400"
            >
              View File
            </a>
          </div>
        )}
        <Button onClick={() => onUpload("")} variant="ghost" type="button">
          <X className="size-4" />
          Remove Logo
        </Button>
      </div>
    );
  }
  return (
    <div className="w-full bg-muted/30">
      <UploadDropzone
        // @ts-ignore
        endpoint={endpoint}
        onClientUploadComplete={(res: Array<UploadedFile>) => {
          onUpload(res[0]?.url);
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          console.log(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
};

export default FileUpload;
