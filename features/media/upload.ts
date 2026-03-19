export type FutureMediaKind = "image" | "audio";

export type FutureMediaPayload = {
  kind: FutureMediaKind;
  path: string;
  mimeType: string;
};

// Reserved for multimodal providers that accept media arrays.
export function normalizeMediaPayload(items: FutureMediaPayload[]) {
  return items.map((item) => ({
    type: item.kind,
    uri: item.path,
    mimeType: item.mimeType,
  }));
}
