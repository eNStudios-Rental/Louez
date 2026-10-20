import "server-only";

import { FilesError } from "files-sdk";
import { createFilesRouter, type FilesApi } from "files-sdk/api";

import { env as authEnv } from "@louez/auth/env";
import { MAX_HERO_VIDEO_SIZE } from "@louez/validations";

import { env } from "@/env";
import { getHeroVideoFiles } from "@/lib/storage/files";
import { getCurrentStore } from "@/lib/store-context";

import { createPublicFilesRequest } from "./util.public-files-request";

let router: FilesApi | undefined;

const getOriginConfig = () => {
  const appUrl = new URL(env.NEXT_PUBLIC_APP_URL);
  const origins = new Set([appUrl.origin]);

  if (env.NEXT_PUBLIC_APP_DOMAIN && env.NEXT_PUBLIC_DASHBOARD_SUBDOMAIN) {
    try {
      origins.add(
        new URL(
          `${appUrl.protocol}//${env.NEXT_PUBLIC_DASHBOARD_SUBDOMAIN}.${env.NEXT_PUBLIC_APP_DOMAIN}`,
        ).origin,
      );
    } catch {
      // A malformed dashboard host only costs the extra allowed origin.
    }
  }

  return { appOrigin: appUrl.origin, allowedOrigins: [...origins] };
};

const createHeroVideoFilesRouter = () => {
  const { allowedOrigins } = getOriginConfig();

  return createFilesRouter({
    files: () => getHeroVideoFiles(),
    operations: ["upload", "url", "delete"],
    allowedOrigins,
    maxUploadSize: MAX_HERO_VIDEO_SIZE,
    secret: `louez-hero-video-upload:${authEnv.AUTH_SECRET}`,
    authorize: async () => {
      const store = await getCurrentStore();
      if (!store) {
        throw new FilesError("Unauthorized", "Store access required");
      }

      return {
        keyPrefix: `${store.id}/hero-video/`,
        disposition: "inline",
      };
    },
  });
};

export const getHeroVideoFilesRouter = () => {
  const currentRouter = router ?? (router = createHeroVideoFilesRouter());

  const { appOrigin, allowedOrigins } = getOriginConfig();
  return {
    handle: (request: Request) =>
      currentRouter.handle(createPublicFilesRequest(request, allowedOrigins, appOrigin)),
  };
};
