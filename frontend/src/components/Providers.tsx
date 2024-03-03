"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import React, { PropsWithChildren } from "react";

import { queryClient } from "@/lib/queryClient";

import { Toaster } from "./ui/sonner";

const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <Toaster position="top-center" richColors duration={5000} closeButton />
    </ThemeProvider>
  );
};

export default Providers;
