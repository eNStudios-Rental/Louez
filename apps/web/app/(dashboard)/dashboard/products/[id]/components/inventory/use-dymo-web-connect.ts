"use client";

import { useCallback } from "react";

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
}

declare global {
  interface Window {
    dymo?: { label: { framework: DymoFramework } };
  }
}

const DYMO_FRAMEWORK_URL =
  "https://cdn.jsdelivr.net/gh/dymosoftware/dymo-connect-framework@master/dymo.connect.framework.min.js";

const LABEL_XML = `<?xml version="1.0" encoding="utf-8"?>
<DesktopLabel Version="1">
  <DYMOLabel Version="3">
    <Description>DYMO Label</Description>
    <Orientation>Landscape</Orientation>
    <LabelName>Small1976411</LabelName>
    <InitialLength>0</InitialLength>
    <BorderStyle>SolidLine</BorderStyle>
    <DYMORect>
      <DYMOPoint>
        <X>0.09</X>
        <Y>0.056666665</Y>
      </DYMOPoint>
      <Size>
        <Width>1.9766666</Width>
        <Height>0.90333337</Height>
      </Size>
    </DYMORect>
    <BorderColor>
      <SolidColorBrush>
        <Color A="1" R="0" G="0" B="0" />
      </SolidColorBrush>
    </BorderColor>
    <BorderThickness>1</BorderThickness>
    <Show_Border>False</Show_Border>
    <DynamicLayoutManager>
      <RotationBehavior>ClearObjects</RotationBehavior>
      <LabelObjects>
        <TextObject>
          <Name>Text</Name>
          <Brushes>
            <BackgroundBrush>
              <SolidColorBrush>
                <Color A="0" R="0.1372549" G="0.1215686" B="0.1254902" />
              </SolidColorBrush>
            </BackgroundBrush>
            <BorderBrush>
              <SolidColorBrush>
                <Color A="1" R="0" G="0" B="0" />
              </SolidColorBrush>
            </BorderBrush>
            <StrokeBrush>
              <SolidColorBrush>
                <Color A="1" R="0" G="0" B="0" />
              </SolidColorBrush>
            </StrokeBrush>
            <FillBrush>
              <SolidColorBrush>
                <Color A="0" R="0.1372549" G="0.1215686" B="0.1254902" />
              </SolidColorBrush>
            </FillBrush>
          </Brushes>
          <Rotation>Rotation0</Rotation>
          <OutlineThickness>1</OutlineThickness>
          <IsOutlined>False</IsOutlined>
          <BorderStyle>SolidLine</BorderStyle>
          <Margin>
            <DYMOThickness Left="0" Top="0" Right="0" Bottom="0" />
          </Margin>
          <HorizontalAlignment>Center</HorizontalAlignment>
          <VerticalAlignment>Middle</VerticalAlignment>
          <FitMode>AlwaysFit</FitMode>
          <IsVertical>False</IsVertical>
          <FormattedText>
            <FitMode>AlwaysFit</FitMode>
            <HorizontalAlignment>Center</HorizontalAlignment>
            <VerticalAlignment>Middle</VerticalAlignment>
            <IsVertical>False</IsVertical>
            <LineTextSpan>
              <TextSpan>
                <Text> </Text>
                <FontInfo>
                  <FontName>Segoe UI</FontName>
                  <FontSize>26.4</FontSize>
                  <IsBold>False</IsBold>
                  <IsItalic>False</IsItalic>
                  <IsUnderline>False</IsUnderline>
                  <FontBrush>
                    <SolidColorBrush>
                      <Color A="1" R="0" G="0" B="0" />
                    </SolidColorBrush>
                  </FontBrush>
                </FontInfo>
              </TextSpan>
            </LineTextSpan>
          </FormattedText>
          <ObjectLayout>
            <DYMOPoint>
              <X>0.13</X>
              <Y>0.1</Y>
            </DYMOPoint>
            <Size>
              <Width>1.8566666</Width>
              <Height>0.8166667</Height>
            </Size>
          </ObjectLayout>
        </TextObject>
      </LabelObjects>
    </DynamicLayoutManager>
  </DYMOLabel>
  <LabelApplication>Blank</LabelApplication>
  <DataTable>
    <Columns></Columns>
    <Rows></Rows>
  </DataTable>
</DesktopLabel>`;

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

      phase = "list printers";
      const printers = await framework.getPrintersAsync();
      const printer = printers.find((item) => item.isConnected) ?? printers[0];
      if (!printer) throw new Error("No DYMO printer found");

      phase = "open label";
      const label = framework.openLabelXml(LABEL_XML);
      if (!label || typeof label.setObjectText !== "function") {
        throw new Error("DYMO could not open the label template");
      }

      phase = "validate label";
      if (label.isValidLabel && !label.isValidLabel()) {
        throw new Error("DYMO label template is invalid");
      }

      phase = "set label text";
      label.setObjectText("Text", referenceNumber);
      phase = "send print request";
      await label.print(printer.name);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`DYMO ${phase}: ${message}`, { cause: error });
    }
  }, []);

  return { printLabel };
};
