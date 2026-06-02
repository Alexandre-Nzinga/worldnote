const SOCKET_RIGHT_SUFFIX = "__right";

/** Strip mirror suffix so persisted links use canonical socket ids. */
export function canonicalSocketId(
  handleId: string | null | undefined,
): string | null {
  if (!handleId) {
    return null;
  }
  if (handleId.endsWith(SOCKET_RIGHT_SUFFIX)) {
    return handleId.slice(0, -SOCKET_RIGHT_SUFFIX.length);
  }
  return handleId;
}

export function socketRightHandleId(socketId: string): string {
  return `${socketId}${SOCKET_RIGHT_SUFFIX}`;
}

export function isEntityHandle(handleId: string | null | undefined): boolean {
  return handleId === "entity" || handleId === "entity__left";
}
