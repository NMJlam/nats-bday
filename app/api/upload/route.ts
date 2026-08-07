import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { auth } from "@/auth";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/media";

// Issues a short-lived client-upload token so the browser uploads media directly
// to Vercel Blob (bypassing the function body limit). Gated on an authenticated
// session; the token itself constrains content-type and size per media kind.
export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const kind = clientPayload === "video" ? "video" : "image";

        return {
          allowedContentTypes:
            kind === "video"
              ? [...ALLOWED_VIDEO_TYPES]
              : [...ALLOWED_IMAGE_TYPES],
          maximumSizeInBytes:
            kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      // The card row is created via POST /api/cards after the client upload
      // resolves, so nothing to persist here.
      onUploadCompleted: async () => {},
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
