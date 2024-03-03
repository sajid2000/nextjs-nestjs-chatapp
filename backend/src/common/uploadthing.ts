import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter: FileRouter = {
  avatar: f({
    image: {
      maxFileSize: "2MB",
    },
  }).onUploadComplete(() => {
    //
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
