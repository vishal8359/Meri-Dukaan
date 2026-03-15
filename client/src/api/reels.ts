import { apiRequest } from "./client";

function buildQueryString(query?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export interface CreateReelPayload {
  videoUrl: string;
  description?: string;
}

export interface UpdateReelPayload {
  description?: string;
}

export function getReelFeed(
  query?: Record<string, string | number | undefined>,
) {
  const suffix = buildQueryString(query);
  return apiRequest<{
    reels: unknown[];
    total: number;
    page: number;
    limit: number;
  }>(`/reels/feed${suffix}`);
}

export function getStoreReels(storeId: string) {
  return apiRequest<{ reels: unknown[] }>(`/stores/${storeId}/reels`);
}

export function getStoreReel(storeId: string, reelId: string) {
  return apiRequest<{ reel: unknown }>(`/stores/${storeId}/reels/${reelId}`);
}

export function createStoreReel(
  token: string,
  storeId: string,
  body: CreateReelPayload,
) {
  return apiRequest<{ reel: unknown }>(`/stores/${storeId}/reels`, {
    method: "POST",
    token,
    body,
  });
}

export function updateStoreReel(
  token: string,
  storeId: string,
  reelId: string,
  body: UpdateReelPayload,
) {
  return apiRequest<{ reel: unknown }>(`/stores/${storeId}/reels/${reelId}`, {
    method: "PUT",
    token,
    body,
  });
}

export function removeStoreReel(
  token: string,
  storeId: string,
  reelId: string,
) {
  return apiRequest<{ message: string }>(`/stores/${storeId}/reels/${reelId}`, {
    method: "DELETE",
    token,
  });
}

export function engageStoreReel(
  token: string,
  storeId: string,
  reelId: string,
  action: "likes" | "shares" | "saves" | "views",
) {
  return apiRequest<{ engagement: unknown }>(
    `/stores/${storeId}/reels/${reelId}/engage/${action}`,
    {
      method: "POST",
      token,
    },
  );
}

export function addStoreReelWatchTime(
  token: string,
  storeId: string,
  reelId: string,
  seconds: number,
) {
  return apiRequest<{ engagement: unknown }>(
    `/stores/${storeId}/reels/${reelId}/watch-time`,
    {
      method: "POST",
      token,
      body: { seconds },
    },
  );
}

// Comments on reels
export function getReelComments(storeId: string, reelId: string) {
  return apiRequest<{ comments: unknown[] }>(
    `/stores/${storeId}/reels/${reelId}/comments`,
  );
}

export function addReelComment(
  token: string,
  storeId: string,
  reelId: string,
  commentText: string,
) {
  return apiRequest<{ comment: unknown }>(
    `/stores/${storeId}/reels/${reelId}/comments`,
    {
      method: "POST",
      token,
      body: { commentText },
    },
  );
}

export function removeReelComment(
  token: string,
  storeId: string,
  reelId: string,
  commentId: string,
) {
  return apiRequest<{ message: string }>(
    `/stores/${storeId}/reels/${reelId}/comments/${commentId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

export function likeReelComment(
  token: string,
  storeId: string,
  reelId: string,
  commentId: string,
) {
  return apiRequest<{ comment: unknown }>(
    `/stores/${storeId}/reels/${reelId}/comments/${commentId}/like`,
    {
      method: "POST",
      token,
    },
  );
}

export function addReelCommentReply(
  token: string,
  storeId: string,
  reelId: string,
  commentId: string,
  replyText: string,
) {
  return apiRequest<{ reply: unknown }>(
    `/stores/${storeId}/reels/${reelId}/comments/${commentId}/replies`,
    {
      method: "POST",
      token,
      body: { replyText },
    },
  );
}

export function removeReelCommentReply(
  token: string,
  storeId: string,
  reelId: string,
  commentId: string,
  replyId: string,
) {
  return apiRequest<{ message: string }>(
    `/stores/${storeId}/reels/${reelId}/comments/${commentId}/replies/${replyId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

export function likeReelCommentReply(
  token: string,
  storeId: string,
  reelId: string,
  commentId: string,
  replyId: string,
) {
  return apiRequest<{ reply: unknown }>(
    `/stores/${storeId}/reels/${reelId}/comments/${commentId}/replies/${replyId}/like`,
    {
      method: "POST",
      token,
    },
  );
}
