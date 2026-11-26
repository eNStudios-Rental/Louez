"use client";

import { useCallback } from "react";

interface DymoPrinter {
  name: string;
  isConnected: boolean;
}

interface DymoLabel {
  setObjectText: (objectName: string, text: string) => void;
  print: (printerName: string) => PromiseLike<unknown> | void;
}

interface DymoFramework {
  init?: (callback?: () => void) => void;
  getPrintersAsync: () => PromiseLike<DymoPrinter[]>;
  openLabelXml: (labelXml: string) => DymoLabel;
}

declare global {
  interface Window {
    dymo?: { label: { framework: DymoFramework } };
  }
}

const DYMO_FRAMEWORK_URL =
  "https://cdn.jsdelivr.net/gh/dymosoftware/dymo-connect-framework@master/dymo.connect.framework.min.js";

const LABEL_XML = `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands />
  <ObjectInfo>
    <TextObject>
      <Name>referenceNumber</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String></String>
          <Attributes>
            <Font Family="Arial" Size="30" Bold="True" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="120" Y="120" Width="4800" Height="1380" />
  </ObjectInfo>
</DieCutLabel>`;

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
    const framework = await loadDymoFramework();
    if (framework.init) {
      await new Promise<void>((resolve) => framework.init?.(resolve));
    }

    const printers = await framework.getPrintersAsync();
    const printer = printers.find((item) => item.isConnected) ?? printers[0];
    if (!printer) throw new Error("No DYMO printer found");

    const label = framework.openLabelXml(LABEL_XML);
    label.setObjectText("referenceNumber", referenceNumber);
    await label.print(printer.name);
  }, []);

  return { printLabel };
};
