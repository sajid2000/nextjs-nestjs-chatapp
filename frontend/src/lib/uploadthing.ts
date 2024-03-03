import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

import { siteConfig } from "@/config";

export type UploadedFile = {
  url: string;
  key: string;
  name: string;
  serverData: any;
  size: number;
};

export const UploadButton = generateUploadButton({
  url: `${siteConfig.apiUrl}/api/uploadthing`,
});

export const UploadDropzone = generateUploadDropzone({
  url: `${siteConfig.apiUrl}/api/uploadthing`,
});
