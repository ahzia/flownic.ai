import { AccessToken } from "livekit-server-sdk";
import { getEnv, hasLiveKitConfig } from "@/shared/env";
import type { MediaJoinGrant, MediaSessionAdapter } from "@/domain/session/media";
import { assertParticipant } from "@/server/services/practice-session";

function roomNameForSession(sessionId: string): string {
  return `flownic_${sessionId.replace(/-/g, "")}`;
}

export function createLiveKitAdapter(): MediaSessionAdapter {
  return {
    async createRoom(sessionId: string) {
      return { roomName: roomNameForSession(sessionId) };
    },
    async issueJoinGrant({ sessionId, participantId }) {
      return issueLiveKitToken({
        sessionId,
        participantId,
        guestKey: participantId,
      });
    },
  };
}

export async function issueLiveKitToken(input: {
  sessionId: string;
  guestKey: string;
  participantId?: string;
}): Promise<MediaJoinGrant> {
  const env = getEnv();
  if (!hasLiveKitConfig(env)) {
    throw new Error("LiveKit is not configured");
  }
  const session = await assertParticipant(input.sessionId, input.guestKey);
  const participant = session.participants.find(
    (p) => p.guestKey === input.guestKey,
  );
  if (!participant) throw new Error("Not a participant");

  const roomName = roomNameForSession(session.id);
  const at = new AccessToken(env.LIVEKIT_API_KEY!, env.LIVEKIT_API_SECRET!, {
    identity: participant.id,
    name: participant.displayName,
    ttl: "30m",
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  return {
    roomName,
    token,
    url: env.NEXT_PUBLIC_LIVEKIT_URL!,
    expiresAt,
  };
}
