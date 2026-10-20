import { MAX_HERO_VIDEO_SIZE } from "@louez/validations";

export { MAX_HERO_VIDEO_SIZE };

export type HeroVideoUploadIssue = "invalidType" | "tooLarge";

export const hasMp4ContainerSignature = (bytes: Uint8Array): boolean =>
  bytes.length >= 8 &&
  bytes[4] === 0x66 &&
  bytes[5] === 0x74 &&
  bytes[6] === 0x79 &&
  bytes[7] === 0x70;

interface HeroVideoFileLike {
  name: string;
  size: number;
  type: string;
}

export const getHeroVideoUploadIssue = (file: HeroVideoFileLike): HeroVideoUploadIssue | null => {
  if (file.type !== "video/mp4" || !file.name.toLowerCase().endsWith(".mp4")) {
    return "invalidType";
  }

  if (file.size > MAX_HERO_VIDEO_SIZE) {
    return "tooLarge";
  }

  return null;
};
