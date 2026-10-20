import { getHeroVideoFilesRouter } from "@/lib/uploads/hero-video-files-router";

const handleRequest = (request: Request) => getHeroVideoFilesRouter().handle(request);

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
