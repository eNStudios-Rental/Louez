import type {
  StorePrintingLabelTemplate,
  StorePrintingLabelTemplateElement,
} from "@louez/types";

const LABEL_CONTENT = {
  x: 0.09,
  y: 0.056666665,
  width: 1.9766666,
  height: 0.90333337,
};

const HORIZONTAL_ALIGNMENT_OFFSET = 0.015;

const formatNumber = (value: number) => Number(value.toFixed(7)).toString();

const getObjectLayout = (element: StorePrintingLabelTemplateElement) => {
  const width = (LABEL_CONTENT.width * element.width) / 100;
  const height = (LABEL_CONTENT.height * element.height) / 100;
  const x = Math.min(
    LABEL_CONTENT.x + LABEL_CONTENT.width - width,
    Math.max(
      LABEL_CONTENT.x,
      LABEL_CONTENT.x + (LABEL_CONTENT.width * element.x) / 100 - HORIZONTAL_ALIGNMENT_OFFSET,
    ),
  );
  const y = LABEL_CONTENT.y + (LABEL_CONTENT.height * element.y) / 100;

  return `<ObjectLayout>
    <DYMOPoint><X>${formatNumber(x)}</X><Y>${formatNumber(y)}</Y></DYMOPoint>
    <Size><Width>${formatNumber(width)}</Width><Height>${formatNumber(height)}</Height></Size>
  </ObjectLayout>`;
};

const textObjectXml = (name: string, element: StorePrintingLabelTemplateElement) => `
  <TextObject>
    <Name>${name}</Name>
    <Brushes>
      <BackgroundBrush><SolidColorBrush><Color A="0" R="0" G="0" B="0" /></SolidColorBrush></BackgroundBrush>
      <BorderBrush><SolidColorBrush><Color A="1" R="0" G="0" B="0" /></SolidColorBrush></BorderBrush>
      <StrokeBrush><SolidColorBrush><Color A="1" R="0" G="0" B="0" /></SolidColorBrush></StrokeBrush>
      <FillBrush><SolidColorBrush><Color A="0" R="0" G="0" B="0" /></SolidColorBrush></FillBrush>
    </Brushes>
    <Rotation>Rotation0</Rotation>
    <OutlineThickness>1</OutlineThickness>
    <IsOutlined>False</IsOutlined>
    <BorderStyle>SolidLine</BorderStyle>
    <Margin><DYMOThickness Left="0" Top="0" Right="0" Bottom="0" /></Margin>
    <HorizontalAlignment>Center</HorizontalAlignment>
    <VerticalAlignment>Middle</VerticalAlignment>
    <FitMode>AlwaysFit</FitMode>
    <IsVertical>False</IsVertical>
    <FormattedText>
      <FitMode>AlwaysFit</FitMode>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <IsVertical>False</IsVertical>
      <LineTextSpan><TextSpan>
        <Text> </Text>
        <FontInfo>
          <FontName>Segoe UI</FontName><FontSize>26.4</FontSize>
          <IsBold>${element.type === "reference" ? "True" : "False"}</IsBold>
          <IsItalic>False</IsItalic><IsUnderline>False</IsUnderline>
          <FontBrush><SolidColorBrush><Color A="1" R="0" G="0" B="0" /></SolidColorBrush></FontBrush>
        </FontInfo>
      </TextSpan></LineTextSpan>
    </FormattedText>
    ${getObjectLayout(element)}
  </TextObject>`;

const imageObjectXml = (name: string, element: StorePrintingLabelTemplateElement) => `
  <ImageObject>
    <Name>${name}</Name>
    <Brushes>
      <BackgroundBrush><SolidColorBrush><Color A="0" R="1" G="1" B="1" /></SolidColorBrush></BackgroundBrush>
      <BorderBrush><SolidColorBrush><Color A="1" R="0" G="0" B="0" /></SolidColorBrush></BorderBrush>
      <StrokeBrush><SolidColorBrush><Color A="1" R="0" G="0" B="0" /></SolidColorBrush></StrokeBrush>
      <FillBrush><SolidColorBrush><Color A="0" R="1" G="1" B="1" /></SolidColorBrush></FillBrush>
    </Brushes>
    <Rotation>Rotation0</Rotation>
    <OutlineThickness>1</OutlineThickness>
    <IsOutlined>False</IsOutlined>
    <Margin><DYMOThickness Left="0" Top="0" Right="0" Bottom="0" /></Margin>
    <Data></Data>
    <ScaleMode>Uniform</ScaleMode>
    <HorizontalAlignment>Center</HorizontalAlignment>
    <VerticalAlignment>Middle</VerticalAlignment>
    ${getObjectLayout(element)}
  </ImageObject>`;

export interface DymoLabelObjectContent {
  name: string;
  type: StorePrintingLabelTemplateElement["type"];
  value: string;
}

export const buildDymoLabelDocument = (
  template: StorePrintingLabelTemplate,
  referenceNumber: string,
) => {
  const contents: DymoLabelObjectContent[] = [];
  const labelObjects = template.elements
    .map((element, index) => {
      const name = `LabelObject${index}`;
      if (element.type === "image") {
        contents.push({ name, type: element.type, value: element.url });
        return imageObjectXml(name, element);
      }

      if (element.type === "qr") {
        contents.push({ name, type: element.type, value: referenceNumber });
        return imageObjectXml(name, element);
      }

      const value = element.type === "text" ? element.text : referenceNumber;
      contents.push({ name, type: element.type, value });
      return textObjectXml(name, element);
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<DesktopLabel Version="1">
  <DYMOLabel Version="3">
    <Description>DYMO Label</Description>
    <Orientation>Landscape</Orientation>
    <LabelName>Small1976411</LabelName>
    <InitialLength>0</InitialLength>
    <BorderStyle>SolidLine</BorderStyle>
    <DYMORect>
      <DYMOPoint><X>${LABEL_CONTENT.x}</X><Y>${LABEL_CONTENT.y}</Y></DYMOPoint>
      <Size><Width>${LABEL_CONTENT.width}</Width><Height>${LABEL_CONTENT.height}</Height></Size>
    </DYMORect>
    <BorderColor><SolidColorBrush><Color A="1" R="0" G="0" B="0" /></SolidColorBrush></BorderColor>
    <BorderThickness>1</BorderThickness>
    <Show_Border>False</Show_Border>
    <DynamicLayoutManager>
      <RotationBehavior>ClearObjects</RotationBehavior>
      <LabelObjects>${labelObjects}</LabelObjects>
    </DynamicLayoutManager>
  </DYMOLabel>
  <LabelApplication>Blank</LabelApplication>
  <DataTable><Columns></Columns><Rows></Rows></DataTable>
</DesktopLabel>`;

  return { xml, contents };
};
