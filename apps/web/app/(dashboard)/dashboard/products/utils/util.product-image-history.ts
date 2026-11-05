import type {
  ProductImageHistory,
  ProductImageVersion,
  ProductImageVersionKind,
} from "@louez/types";

const createHistoryId = () =>
  `product-image-history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createVersion = (
  url: string,
  kind: ProductImageVersionKind,
  createdAt = new Date().toISOString(),
): ProductImageVersion => ({
  id: `product-image-version-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  url,
  kind,
  createdAt,
});

export const createInitialProductImageHistory = (
  images: string[],
  histories: ProductImageHistory[] = [],
): ProductImageHistory[] => {
  const claimedUrls = new Set(
    histories.flatMap((history) => history.versions.map(({ url }) => url)),
  );
  const claimedHistoryIds = new Set(histories.map(({ id }) => id));
  const claimedVersionIds = new Set(
    histories.flatMap((history) => history.versions.map(({ id }) => id)),
  );
  let initialSequence = 1;
  const missingHistories = images.flatMap<ProductImageHistory>((url) => {
    if (claimedUrls.has(url)) return [];

    while (
      claimedHistoryIds.has(`product-image-history-initial-${initialSequence}`) ||
      claimedVersionIds.has(`product-image-version-initial-${initialSequence}`)
    ) {
      initialSequence += 1;
    }
    const historyId = `product-image-history-initial-${initialSequence}`;
    const versionId = `product-image-version-initial-${initialSequence}`;
    claimedHistoryIds.add(historyId);
    claimedVersionIds.add(versionId);
    initialSequence += 1;

    return [
      {
        id: historyId,
        versions: [
          {
            id: versionId,
            url,
            kind: "original",
          },
        ],
      },
    ];
  });

  return [...histories, ...missingHistories];
};

export const findProductImageHistory = (
  histories: ProductImageHistory[],
  imageUrl: string,
): ProductImageHistory | null =>
  histories.find((history) => history.versions.some(({ url }) => url === imageUrl)) ?? null;

export const addProductImageHistory = (
  histories: ProductImageHistory[],
  imageUrl: string,
  alt?: string,
): ProductImageHistory[] => {
  if (findProductImageHistory(histories, imageUrl)) return histories;

  return [
    ...histories,
    {
      id: createHistoryId(),
      alt,
      versions: [createVersion(imageUrl, "original")],
    },
  ];
};

export const setProductImageAlt = (
  histories: ProductImageHistory[],
  imageUrl: string,
  alt: string,
): ProductImageHistory[] => {
  const sourceHistory = findProductImageHistory(histories, imageUrl);
  if (!sourceHistory) return histories;

  return histories.map((history) =>
    history.id === sourceHistory.id ? { ...history, alt } : history,
  );
};

export const appendProductImageVersion = (
  histories: ProductImageHistory[],
  sourceUrl: string,
  nextUrl: string,
  kind: ProductImageVersionKind,
): ProductImageHistory[] => {
  const sourceHistory = findProductImageHistory(histories, sourceUrl);

  if (!sourceHistory) {
    return [
      ...histories,
      {
        id: createHistoryId(),
        versions: [createVersion(sourceUrl, "original"), createVersion(nextUrl, kind)],
      },
    ];
  }

  if (sourceHistory.versions.some(({ url }) => url === nextUrl)) return histories;

  return histories.map((history) =>
    history.id === sourceHistory.id
      ? { ...history, versions: [...history.versions, createVersion(nextUrl, kind)] }
      : history,
  );
};

export const removeProductImageHistory = (
  histories: ProductImageHistory[],
  imageUrl: string,
): ProductImageHistory[] => {
  const history = findProductImageHistory(histories, imageUrl);
  return history ? histories.filter(({ id }) => id !== history.id) : histories;
};

export const removeProductImageVersion = (
  histories: ProductImageHistory[],
  historyId: string,
  versionId: string,
): ProductImageHistory[] =>
  histories.map((history) => {
    if (history.id !== historyId || history.versions.length <= 1) return history;

    return {
      ...history,
      versions: history.versions.filter(({ id }) => id !== versionId),
    };
  });

export const collectProductImageUrls = (
  images: string[],
  histories: ProductImageHistory[],
): string[] =>
  Array.from(
    new Set([...images, ...histories.flatMap((history) => history.versions.map(({ url }) => url))]),
  );
