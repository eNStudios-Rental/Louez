import { MAX_HERO_VIDEO_SIZE } from "@louez/validations";
import type { Body } from "files-sdk";

export { MAX_HERO_VIDEO_SIZE };

export type HeroVideoUploadIssue = "invalidType" | "tooLarge";

export const hasMp4ContainerSignature = (bytes: Uint8Array): boolean =>
  bytes.length >= 8 &&
  bytes[4] === 0x66 &&
  bytes[5] === 0x74 &&
  bytes[6] === 0x79 &&
  bytes[7] === 0x70;

export const inspectMp4Container = async (body: Body): Promise<Body | null> => {
  if (body instanceof Blob) {
    const signature = new Uint8Array(await body.slice(0, 8).arrayBuffer());
    return hasMp4ContainerSignature(signature) ? body : null;
  }

  if (body instanceof ReadableStream) {
    const reader = body.getReader();
    const buffered: Uint8Array[] = [];
    let bufferedLength = 0;
    let ended = false;

    while (bufferedLength < 8) {
      const { done, value } = await reader.read();
      if (done) {
        ended = true;
        break;
      }
      if (value) {
        buffered.push(value);
        bufferedLength += value.byteLength;
      }
    }

    const signature = new Uint8Array(Math.min(bufferedLength, 8));
    let signatureOffset = 0;
    for (const chunk of buffered) {
      const length = Math.min(chunk.byteLength, signature.length - signatureOffset);
      signature.set(chunk.subarray(0, length), signatureOffset);
      signatureOffset += length;
      if (signatureOffset === signature.length) break;
    }

    if (!hasMp4ContainerSignature(signature)) {
      await reader.cancel();
      return null;
    }

    return new ReadableStream({
      start(controller) {
        for (const chunk of buffered) controller.enqueue(chunk);
        if (ended) controller.close();
      },
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
        } else if (value) {
          controller.enqueue(value);
        }
      },
      cancel(reason) {
        return reader.cancel(reason);
      },
    });
  }

  let bytes: Uint8Array;
  if (typeof body === "string") {
    bytes = new TextEncoder().encode(body.slice(0, 8));
  } else if (body instanceof ArrayBuffer) {
    bytes = new Uint8Array(body, 0, Math.min(8, body.byteLength));
  } else if (ArrayBuffer.isView(body)) {
    bytes = new Uint8Array(body.buffer, body.byteOffset, Math.min(8, body.byteLength));
  } else {
    return null;
  }

  return hasMp4ContainerSignature(bytes) ? body : null;
};

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
