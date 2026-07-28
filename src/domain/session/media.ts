/**
 * Provider-neutral media adapter contract (video guide V01).
 * LiveKit implementation lives under src/server/livekit only.
 */

export type MediaParticipantIdentity = {
  sessionId: string;
  participantId: string;
};

export type MediaJoinGrant = {
  roomName: string;
  token: string;
  url: string;
  expiresAt: string;
};

export type MediaSessionAdapter = {
  createRoom(sessionId: string): Promise<{ roomName: string }>;
  issueJoinGrant(
    identity: MediaParticipantIdentity,
  ): Promise<MediaJoinGrant>;
  revokeParticipant?(identity: MediaParticipantIdentity): Promise<void>;
};
