"use client";

import { useCallback } from "react";

import { DEFAULT_STORE_PRINTING_LABEL_TEMPLATE } from "@louez/types";

import {
  generatePrintingLabelQr,
  getPrintingLabelTemplate,
} from "@/app/(dashboard)/dashboard/settings/actions";

import { buildDymoLabelDocument } from "./util.dymo-label-template";

interface DymoPrinter {
  name: string;
  isConnected: boolean;
}

interface DymoLabel {
  setObjectText: (objectName: string, text: string) => void;
  isValidLabel?: () => boolean;
  print: (printerName: string) => PromiseLike<unknown> | void;
}

interface DymoFramework {
  init?: (callback?: () => void) => void;
  getPrintersAsync: () => PromiseLike<DymoPrinter[]>;
  openLabelXml: (labelXml: string) => DymoLabel | null | undefined;
  loadImageAsPngBase64Async?: (imageUrl: string) => PromiseLike<string>;
}

declare global {
  interface Window {
    dymo?: { label: { framework: DymoFramework } };
  }
}

const DYMO_FRAMEWORK_URL =
  "https://cdn.jsdelivr.net/gh/dymosoftware/dymo-connect-framework@master/dymo.connect.framework.min.js";

let frameworkPromise: Promise<DymoFramework> | undefined;

const loadDymoFramework = () => {
  if (window.dymo?.label.framework) return Promise.resolve(window.dymo.label.framework);
  if (frameworkPromise) return frameworkPromise;

  frameworkPromise = new Promise<DymoFramework>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${DYMO_FRAMEWORK_URL}"]`,
    );
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      const framework = window.dymo?.label.framework;
      if (framework) resolve(framework);
      else reject(new Error("DYMO Web Connect did not initialize"));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Unable to load DYMO Web Connect")),
      { once: true },
    );

    if (!existingScript) {
      script.src = DYMO_FRAMEWORK_URL;
      script.async = true;
      document.head.append(script);
    }
  }).catch((error: unknown) => {
    frameworkPromise = undefined;
    throw error;
  });

  return frameworkPromise;
};

export const useDymoWebConnect = () => {
  const printLabel = useCallback(async (referenceNumber: string) => {
    let phase = "load framework";
    try {
      const framework = await loadDymoFramework();
      if (framework.init) {
        phase = "initialize framework";
        await new Promise<void>((resolve) => framework.init?.(resolve));
      }

      phase = "load label settings";
      const template =
        (await getPrintingLabelTemplate()) ?? DEFAULT_STORE_PRINTING_LABEL_TEMPLATE;
      const { xml, contents } = buildDymoLabelDocument(template, referenceNumber);

      phase = "list printers";
      const printers = await framework.getPrintersAsync();
      const printer = printers.find((item) => item.isConnected) ?? printers[0];
      if (!printer) throw new Error("No DYMO printer found");

      phase = "open label";
      const label = framework.openLabelXml(xml);
      if (!label || typeof label.setObjectText !== "function") {
        throw new Error("DYMO could not open the label template");
      }

      phase = "validate label";
      if (label.isValidLabel && !label.isValidLabel()) {
        throw new Error("DYMO label template is invalid");
      }

      for (const content of contents) {
        phase =
          content.type === "image"
            ? "load label image"
            : content.type === "qr"
              ? "generate QR code"
              : "set label content";
        let value = content.value;
        if (content.type === "image") {
          if (!framework.loadImageAsPngBase64Async) {
            throw new Error("DYMO image conversion is unavailable");
          }
          value = await framework.loadImageAsPngBase64Async(
            new URL(content.value, window.location.origin).toString(),
          );
        } else if (content.type === "qr") {
          value = await generatePrintingLabelQr(content.value);
        }
        label.setObjectText(content.name, value);
      }

      phase = "send print request";
      await label.print(printer.name);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`DYMO ${phase}: ${message}`, { cause: error });
    }
  }, []);

  return { printLabel };
};
