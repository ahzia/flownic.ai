# Flownic MVP Online Video Simulation Technology Guide

**Decision guide, provider comparison, replaceable architecture, and implementation strategy**

**Prepared for:** Ahmad Zia Yousufi and Ahmad Zamir Yousufi
**Version:** 1.0
**Date:** 28 July 2026
**Status:** Architecture decision for the YC MVP
**Companion documents:**

- *Flownic YC MVP Business Plan*
- *Flownic YC MVP Technical Requirements and Cursor Implementation Guide*
- *Flownic Product Overview — Business Vision and MVP Guardrails*

---

## 1. Purpose

This document answers one narrow question:

> What technology should Flownic use for live online peer video simulations in the first MVP, while keeping implementation simple and making a future provider change manageable?

The recommendation is based on Flownic's actual product, not on generic video-call requirements. A Flownic session is not merely a meeting. It combines:

- two authenticated candidates;
- a private role-specific view for each participant;
- a synchronized exam stage and timer;
- role switching;
- AI-generated examiner guidance and follow-ups;
- per-speaker transcript evidence;
- post-session feedback;
- an AI examiner fallback; and
- attendance, completion, and quality analytics.

The media provider should transport audio and video. It must not become the source of truth for Flownic's exam, role, timer, booking, transcript, or report state.

---

## 2. Decision summary

### Recommended MVP choice

Use **LiveKit Cloud with its React prefab components**:

- `PreJoin` for microphone/camera checks;
- `VideoConference` for a ready-made video UI, or `AudioConference` if the first pilot is audio-first;
- server-generated, short-lived, room-scoped participant tokens;
- LiveKit room events for connection telemetry only; and
- Flownic's own server/database for every product and exam state.

Do not build a low-level WebRTC stack or a fully custom video-conference UI in the first release.

### Why this remains the best choice

LiveKit is not the absolute minimum-code option, but it is the best balance of:

1. **MVP speed:** ready-made React pre-join, conference, participant, control, and connection components.
2. **Product control:** media tiles can live inside Flownic's custom exam interface.
3. **AI expansion:** the same realtime infrastructure can later support an AI examiner participant, speech-to-text workers, and track-level processing.
4. **Replaceability:** rooms, participants, and tracks map cleanly to a small internal media adapter.
5. **Cost at pilot scale:** the current free Build tier includes 5,000 WebRTC participant-minutes and 100 concurrent connections.
6. **Future optionality:** LiveKit is open source, even though the MVP should use LiveKit Cloud rather than self-hosting.

### Absolute fastest alternative

If the only goal were to place a generic embedded call on a page within hours, **Daily Prebuilt** would be the easiest. It renders a complete call UI in an iframe and exposes call lifecycle events through JavaScript.

Daily Prebuilt is a credible fallback if LiveKit takes materially longer than the estimate. It is not the primary recommendation because Flownic will quickly need deeper control over role-specific layout, participant tracks, AI participation, and the relationship between media and exam stages.

### Zoom and Google Meet decision

- **Do not use the ordinary Zoom Meeting API or Google Meet REST API as the primary MVP media layer.** They are primarily meeting-management integrations, not a neutral embedded media foundation.
- **Zoom Video SDK** is technically capable, but offers no decisive MVP advantage over LiveKit and introduces a heavier Zoom-specific development and commercial model.
- **Google Meet** is acceptable as an external emergency/pilot link. Its REST API can create meeting spaces and retrieve artifacts, while its add-on model embeds Flownic inside Meet rather than embedding a Flownic-owned call experience inside the product.

---

## 3. The decision in one table

Scores use 1 = poor and 5 = excellent for Flownic's MVP.

| Option | Speed to first reliable call | Custom Flownic UX | AI/transcript fit | Operational burden | Replaceability | MVP verdict |
|---|---:|---:|---:|---:|---:|---|
| **LiveKit Cloud + React prefabs** | 4 | 5 | 5 | 4 | 5 | **Recommended** |
| **Daily Prebuilt** | 5 | 3 | 4 | 5 | 4 | Fastest fallback |
| Daily React/custom UI | 4 | 5 | 4 | 4 | 4 | Strong alternative |
| Zoom Video SDK + UI Toolkit | 3 | 4 | 4 | 4 | 3 | Capable, unnecessary now |
| Whereby Embedded | 5 | 3 | 3 | 5 | 4 | Good generic-call fallback |
| Google Meet REST/add-on APIs | 3 | 2 | 2 | 3 | 2 | External fallback only |
| Zoom Meeting SDK/API | 3 | 2 | 2 | 3 | 2 | External fallback only |
| Jitsi iframe / JaaS | 4 | 3 | 2 | 3 | 4 | Prototype option, not first choice |
| Self-hosted Jitsi or LiveKit | 1 | 5 | 5 | 1 | 5 | Not for MVP |
| Raw browser WebRTC | 1 | 5 | 5 | 1 | 5 | Explicitly reject |

---

## 4. What must be owned by Flownic

Provider replacement is realistic only if product state stays outside the provider.

| Flownic owns | Media provider owns |
|---|---|
| Booking and participant assignment | Temporary room connectivity |
| Authenticated session membership | Audio/video transport |
| Candidate/examiner role and permissions | Device and track state |
| Exam blueprint version | Connection quality signals |
| Current round, stage, and timer | Temporary participant presence |
| Private instructions and follow-up suggestions | Optional recording/egress when explicitly enabled |
| Role switching | Provider-level webhook delivery |
| Transcript segments and speaker mapping | Optional provider transcription transport |
| Completion decision | |
| Feedback and reports | |
| Consent and retention policy | |
| Product analytics and cost ledger | |

Never infer that an exam session is complete merely because a provider room ended. Never use a provider room name as the public session identifier.

---

## 5. Option analysis

### 5.1 LiveKit Cloud with React prefabs — recommended

LiveKit supplies managed WebRTC rooms and official React components. Its prefab components provide practical defaults, while lower-level components and hooks allow progressive customization.

**Advantages**

- Works naturally in Next.js/React.
- Provides ready-made pre-join, conference, device, participant, and control UI.
- Gives track- and participant-level control without implementing WebRTC signalling, TURN, reconnects, and subscription management.
- Suits an audio-first MVP while retaining optional video.
- Can later add an AI participant without changing the peer-session model.
- Open-source protocol/server reduces architectural lock-in.
- Current Build plan is sufficient for a small pilot.

**Disadvantages**

- Slightly more application code than embedding a complete iframe.
- Cursor can over-customize the media UI unless the first task is explicitly limited to prefabs.
- Recording, egress, agents, and advanced inference are separate capabilities and cost centres.

**Estimated MVP effort**

| Deliverable | Founder time |
|---|---:|
| Cloud project, environment config, server token endpoint | 0.5–1 day |
| Pre-join and prefab room UI | 1–1.5 days |
| Membership checks, presence events, leave/reconnect states | 1–1.5 days |
| Two-device/browser QA and recovery handling | 1–2 days |
| **Reliable media layer total** | **3.5–6 days** |

This estimate excludes Flownic's exam state machine, transcript pipeline, AI logic, and feedback report.

### 5.2 Daily Prebuilt — easiest implementation

Daily Prebuilt renders a full call experience in an iframe. Daily's JavaScript API still exposes room and participant lifecycle events.

**Advantages**

- Fastest credible path to an embedded, managed call.
- Minimal call-UI code.
- Built-in realtime and post-call transcription options.
- Simple usage-based pilot pricing; current pricing includes 10,000 free participant-minutes per month.
- Can later move from Prebuilt to Daily React without changing the provider.

**Disadvantages**

- The iframe owns the call layout and controls.
- Flownic's exam UI must live beside or around the embedded call rather than composing the call interface at component level.
- Deep custom UX may require a later move to Daily React.
- The apparent one-day saving can disappear once private role views, stage synchronization, mobile layout, and transcript identity are added.

**Estimated MVP effort**

| Deliverable | Founder time |
|---|---:|
| Room creation and expiring meeting token endpoint | 0.5 day |
| Prebuilt iframe and basic events | 0.5–1 day |
| Membership, leave/reconnect states, QA | 1–1.5 days |
| **Reliable media layer total** | **2–3 days** |

**Use Daily instead of LiveKit when**

- the first real peer call must happen within 48 hours;
- the existing code has no media implementation;
- a prebuilt call box beside the exam instructions is acceptable for the first 20 sessions; and
- the team formally accepts a later move from iframe UI to component-level media UI.

### 5.3 Daily React/custom UI

Daily React exposes reactive hooks and media components rather than a complete iframe. It is close to LiveKit in implementation style.

It is a strong alternative if Daily's built-in transcription and audio-only pricing are decisive. Once Flownic is building a custom UI, however, LiveKit's open-source architecture and AI-agent path make LiveKit the preferred default.

### 5.4 Zoom Video SDK

Zoom offers two distinct products that must not be confused:

- **Meeting SDK:** embeds the familiar Zoom meeting experience and follows Zoom Meetings licensing.
- **Video SDK:** supplies Zoom's media infrastructure for a custom product and cannot join ordinary Zoom Meetings.

The Video SDK supports audio, video, screen sharing, chat, data streams, recording, transcription, translation, and UI toolkits. It is technically suitable.

**Why not select it now**

- Flownic gains little over LiveKit for a two-person browser session.
- Web SDK assets, required minimum-version policies, and Zoom-specific commercial packaging add complexity.
- The ecosystem is optimized around Zoom's platform rather than Flownic's future AI-native session model.

Reconsider Zoom Video SDK only if pilots reveal a clear Zoom-specific benefit such as enterprise customer requirements, network performance in a target geography, or a needed Zoom capability unavailable elsewhere.

### 5.5 Zoom Meeting SDK or REST API

The Meeting SDK can embed a Zoom-like interface, but web customization is more constrained than a purpose-built video SDK. The ordinary Zoom API can create and manage meetings, but users remain in the Zoom meeting model.

This is useful for:

- a temporary founder-run pilot;
- an external backup link;
- teacher-led events where Zoom familiarity matters.

It is weak for Flownic's core product because exam stages, private role guidance, AI participation, and media/transcript control would be split between Zoom and Flownic.

### 5.6 Google Meet APIs

Google currently provides:

- a REST API to create/manage meeting spaces and retrieve participants, recordings, and transcripts;
- an add-ons SDK that places an app inside Google Meet; and
- a Media API in Developer Preview for raw streams.

This is not the right primary foundation. The REST API manages Meet; it is not a general custom video SDK. The add-on direction makes Flownic an extension of Meet. Transcript artifacts are post-meeting resources and depend on meeting configuration, OAuth, and Workspace capabilities.

Use Google Meet only as:

- a manually generated external link during the earliest concierge test; or
- an outage fallback stored in `sessions.external_fallback_url`.

### 5.7 Whereby Embedded

Whereby Embedded is a credible minimal-code option with programmatic room creation and an embedded call UI. It is attractive for a conventional two-person consultation product.

For Flownic, it ranks below Daily because Daily has a clearer transition from Prebuilt to React-level control and integrated realtime transcription. It ranks below LiveKit for AI and track-level customization.

### 5.8 Jitsi

Jitsi offers an iframe API, React SDK, and low-level library. It can be quick for a prototype and has strong open-source optionality.

Do not self-host Jitsi for the MVP. Operating, updating, securing, scaling, and monitoring a realtime media stack is not validation work. A managed Jitsi service can be reconsidered only if cost, data control, or open-source deployment becomes a measured requirement.

### 5.9 Raw WebRTC

Raw WebRTC requires the team to solve:

- signalling;
- STUN/TURN;
- NAT and firewall traversal;
- device and browser differences;
- reconnect and track replacement;
- bandwidth adaptation;
- monitoring and debugging; and
- recording/transcription routing.

It provides no YC-relevant learning and should not be built.

---

## 6. Why a generic meeting link is not enough

A Zoom or Meet link can validate whether people will attend a scheduled call. It cannot validate whether Flownic's guided session experience is better than an ordinary call.

| Hypothesis | Generic meeting link | Embedded Flownic session |
|---|---:|---:|
| Candidates attend a scheduled peer call | Yes | Yes |
| Private role guidance improves the simulation | Weak/manual | Yes |
| Synchronized stages reduce confusion | No | Yes |
| Role switching works without founder intervention | No | Yes |
| AI helps the examiner ask useful follow-ups | Awkward | Yes |
| Absence can transition into AI fallback | No | Yes |
| Completion and repeat behavior are measured cleanly | Partial | Yes |

An external meeting link is acceptable for the first handful of concierge interviews or as an operational rescue. It should not be the demo architecture presented as the product.

---

## 7. Replaceable media architecture

### 7.1 Internal boundary

All provider SDK imports must remain inside:

```text
src/infrastructure/media/livekit/
```

Product components must depend on a Flownic-owned interface:

```ts
export interface MediaSessionAdapter {
  prepareJoin(input: {
    sessionId: string;
    participantId: string;
  }): Promise<MediaJoinGrant>;

  connect(grant: MediaJoinGrant): Promise<void>;
  disconnect(reason?: string): Promise<void>;

  setMicrophoneEnabled(enabled: boolean): Promise<void>;
  setCameraEnabled(enabled: boolean): Promise<void>;

  subscribe(listener: (event: MediaEvent) => void): () => void;
  getSnapshot(): MediaSnapshot;
}

export type MediaEvent =
  | { type: "connected" }
  | { type: "reconnecting" }
  | { type: "reconnected" }
  | { type: "participant_joined"; participantRef: string }
  | { type: "participant_left"; participantRef: string }
  | { type: "track_state_changed"; participantRef: string }
  | { type: "disconnected"; reason?: string }
  | { type: "error"; code: string; recoverable: boolean };
```

Provider-specific room names, SIDs, token claims, error objects, and participant objects must not escape this infrastructure module.

### 7.2 Important realism

An adapter reduces migration cost; it does not make providers interchangeable in one hour. UI components, recordings, transcription, webhooks, and failure semantics still differ.

The target is:

> Replace the media transport without rewriting booking, authorization, exam stages, role privacy, reports, or analytics.

### 7.3 Database fields

Use neutral names:

```text
sessions
  media_provider
  media_room_ref
  media_region
  media_status
  external_fallback_url

session_participants
  provider_participant_ref
  joined_at
  left_at
  connection_quality_summary

media_events
  session_id
  participant_id
  provider
  event_type
  provider_event_ref
  occurred_at
  safe_metadata_json
```

Do not create columns named `livekit_room_sid` in core domain tables. If provider-specific metadata is genuinely required, keep it in the adapter's own metadata JSON or provider table.

---

## 8. Recommended MVP layout

Desktop:

```text
┌──────────────────────────────────────────────────────────────┐
│ Stage name · Round · Shared timer · Connection state        │
├───────────────────────────────┬──────────────────────────────┤
│ Managed media area            │ Private role panel           │
│ - two participant tiles       │ - task and materials         │
│ - mic/camera/leave controls   │ - examiner guidance          │
│ - reconnect indicator         │ - request follow-up button   │
├───────────────────────────────┴──────────────────────────────┤
│ Shared stage actions · Help · Report/leave                  │
└──────────────────────────────────────────────────────────────┘
```

Mobile:

- media tiles remain visible in a compact top section;
- the private role task receives most of the screen;
- the shared timer stays sticky;
- media controls remain reachable;
- no critical instruction is hidden only in a hover state;
- video may default off on weak connections.

LiveKit provides the media and device components. Flownic owns the surrounding session shell.

---

## 9. Implementation strategy

### Phase 0 — one-day decision spike

Build a disposable vertical spike before integrating the full session:

1. Create a LiveKit Cloud Build project.
2. Add a server-only token endpoint.
3. Render `PreJoin` and `VideoConference`.
4. Connect two real devices on different networks.
5. Test microphone, camera, mute, leave, and reconnect.
6. Confirm Safari/iOS behavior on at least one real device.
7. Record actual implementation time and blockers.

**Decision gate**

- Continue with LiveKit if two devices can connect reliably and the basic shell takes no more than two founder-days.
- Run a Daily Prebuilt spike if LiveKit fails the gate because of a concrete SDK/browser blocker.
- Do not switch merely because the default UI needs visual polish.

### Phase 1 — reliable peer media

Implement:

- authenticated session membership check;
- short-lived room-scoped token issuance;
- deterministic internal-to-provider participant mapping;
- pre-join device test;
- audio/video controls;
- participant presence;
- reconnect and recoverable error UI;
- explicit leave;
- provider webhook signature verification;
- safe media lifecycle analytics.

At the end of this phase, two assigned users must be able to complete a 20-minute call without any exam or AI functionality.

### Phase 2 — Flownic session shell

Add the existing exam state machine around the media:

- server-authorized role payloads;
- synchronized stage and timer;
- role-specific private panel;
- role switching;
- examiner-only follow-up action;
- completion confirmation.

Do not transmit hidden role instructions through LiveKit metadata or data messages. Retrieve them through server-authorized Flownic APIs.

### Phase 3 — transcription as an independent capability

Transcription must not be required for call continuity.

Choose one of these paths after a two-device test:

1. LiveKit-compatible server/agent transcription with separate participant tracks.
2. Consented short-lived track egress followed by batch transcription.
3. A separate provider adapter for speech-to-text.

Requirements:

- stable speaker-to-participant mapping;
- segment timestamps;
- transcript coverage measurement;
- retryable persistence;
- explicit degraded state;
- no permanent recording by default.

Do not duplicate each participant's microphone into a second browser connection merely to obtain a transcript unless cross-browser tests prove it reliable.

### Phase 4 — AI examiner fallback

Treat the AI examiner as a different session mode that uses the same blueprint and report contracts.

Prefer:

- one media room abstraction;
- a participant type of `human` or `ai`;
- separate AI voice orchestration behind `AiExaminerAdapter`;
- no dependency from the peer call to the AI agent runtime.

The peer call must still work if every AI service is unavailable.

### Phase 5 — pilot hardening

Before real users:

- test two accounts in two browsers and on two networks;
- test denied microphone/camera permission;
- test one participant joining late;
- test refresh and reconnect;
- test one participant leaving and returning;
- test invalid/forwarded session URL;
- test video-disabled audio-only mode;
- test provider webhook replay/idempotency;
- verify no hidden role content appears in network responses or logs;
- verify the call continues when transcription and AI are disabled;
- set provider usage alerts and record cost per completed session.

---

## 10. Cursor implementation sequence

Give Cursor one bounded work package at a time.

| Package | Scope | Estimate | Proof required |
|---|---|---:|---|
| V01 | Media domain types and adapter contract only | 0.5 day | Unit/type tests; no provider imports outside infrastructure |
| V02 | LiveKit server token adapter | 0.5–1 day | Unauthorized and wrong-session tests |
| V03 | Pre-join and prefab conference UI | 1 day | Two local clients join |
| V04 | Presence, reconnect, errors, and leave | 1–1.5 days | Forced reconnect scenario |
| V05 | Webhook verification and idempotent media events | 0.5–1 day | Replay/signature tests |
| V06 | Session shell integration | 1–2 days | Two-user stage and role test |
| V07 | Mobile/audio-first behavior | 0.5–1 day | Real iOS Safari and Android Chrome |
| V08 | Production synthetic session and monitoring | 0.5–1 day | Completed production test record |

Suggested first Cursor prompt:

> Implement work package V01 only. Read the Flownic MVP technical specification and this video technology guide. Create provider-neutral media domain types and a `MediaSessionAdapter` contract. Do not install a provider SDK, create UI, change the database, or implement LiveKit yet. First inspect the repository and report relevant existing abstractions. Then propose the smallest file diff and tests. Stop for approval before editing if an existing media implementation conflicts with the guide.

Suggested LiveKit prompt:

> Implement work package V02 only using the official current LiveKit server SDK. Issue a short-lived token only after server-side authentication, session membership, and join-window checks. Grant access only to the assigned room with minimal publish/subscribe permissions. Keep every LiveKit import under the media infrastructure module. Add negative tests for unauthenticated users, non-members, expired join windows, and attempts to select another room. Do not add the room UI yet.

---

## 11. Security, privacy, and consent

- Generate provider credentials only on the server.
- Tokens must be short-lived and limited to one participant and one room.
- A session URL alone never grants access.
- Use an opaque provider room name; never use candidate names or email addresses.
- Verify provider webhook signatures before processing.
- Make webhook handlers idempotent.
- Do not store raw provider tokens.
- Do not log transcript text, private instructions, names, emails, or provider secrets.
- Keep recording off by default.
- Obtain separate, explicit consent before any pilot-quality recording.
- Show clear camera, microphone, transcription, and recording states.
- Keep the media provider's DPA, subprocessor list, retention behavior, and EU routing options under review before a public launch.

This guide is an engineering decision, not legal advice. Final GDPR notices, processing purposes, and retention periods require an appropriate legal review.

---

## 12. Cost model for pilot decisions

For a two-person session:

```text
participant minutes = 2 × connected session minutes
```

Example for 100 completed 20-minute peer sessions:

```text
2 participants × 20 minutes × 100 sessions = 4,000 participant-minutes
```

At current published allowances, this fits within both:

- LiveKit Build's 5,000 included WebRTC minutes; and
- Daily's 10,000 free participant-minutes.

This does **not** include:

- AI examiner model usage;
- speech-to-text;
- recording/egress;
- storage;
- email;
- error monitoring; or
- application hosting/database usage.

Record costs by capability:

```text
media_transport_cost
transcription_cost
ai_follow_up_cost
ai_examiner_cost
report_generation_cost
recording_or_egress_cost
```

Do not optimize provider cents before measuring session completion, repeat booking, and report usefulness.

---

## 13. Migration plan if LiveKit must be replaced

### Triggers

Consider migration only when evidence shows:

- persistent browser or network failures in the target users;
- unacceptable support burden;
- a provider requirement from paying schools;
- material cost differences at measured volume;
- a compliance/data-residency requirement;
- missing transcription or AI capabilities that cannot be added cleanly; or
- provider reliability below the pilot target.

### Migration sequence

1. Freeze the provider-neutral adapter contract.
2. Add a second adapter behind a feature flag.
3. Map internal session/participant IDs to the new provider.
4. Implement the same normalized media events.
5. Run the same two-user browser test suite.
6. Route only seeded/internal sessions to the new adapter.
7. Route a small pilot cohort.
8. Compare completion, reconnect, join latency, quality, and cost.
9. Migrate remaining sessions only after passing the acceptance gates.
10. Remove the old adapter after its provider rooms, webhooks, data, and secrets are retired safely.

Never attempt an in-progress room migration. Provider selection is fixed when a session room is provisioned.

---

## 14. Fallback hierarchy

| Failure | User experience | Technical response |
|---|---|---|
| Camera fails | Continue audio-only | Disable video; keep session active |
| Weak connection | Prefer audio and compact tiles | Unpublish video; show recoverable notice |
| Transcription fails | Continue the peer simulation | Mark transcript degraded; offer limited report |
| AI follow-up fails | Examiner uses blueprint prompts | Show predefined fallback prompts |
| AI examiner fails | Reschedule or use external rescue | Preserve booking/session evidence |
| LiveKit cannot connect | Retry, then use external link if staff enables it | Log provider failure and fallback use |
| Provider-wide outage | Founder sends controlled Zoom/Meet fallback | Set `external_fallback_url`; mark session seeded/external |

External Zoom/Meet sessions must be labelled in analytics. They should not be counted as proof that the embedded Flownic experience worked.

---

## 15. Acceptance criteria

The media MVP is complete only when:

- [ ] Two assigned authenticated users can join the same room.
- [ ] An authenticated non-member cannot obtain a token.
- [ ] A forwarded session URL does not grant room access.
- [ ] Each user sees only server-authorized role content.
- [ ] Users can test/select devices before joining.
- [ ] Mute, camera, leave, and reconnect states work.
- [ ] A weak-connection path can continue audio-only.
- [ ] Refresh/rejoin does not create a second Flownic participant.
- [ ] Provider events do not decide exam completion.
- [ ] The exam flow continues when AI and transcription are disabled.
- [ ] Mobile browser controls remain usable.
- [ ] Webhook signature and replay tests pass.
- [ ] No secrets or private role content appear in browser bundles, analytics, or logs.
- [ ] One full production synthetic session is completed on two real networks.
- [ ] Actual join latency, failure reason, participant-minutes, and estimated cost are recorded.

---

## 16. Final recommendation and decision rule

**Adopt LiveKit Cloud with React prefabs for the Flownic YC MVP.**

Preserve the recommendation from the broader technical specification, with one refinement: use the prefab UI first. Do not spend MVP time recreating video tiles, device selection, controls, or conference layout.

Use the following rule:

1. Run the one-day LiveKit spike.
2. Continue if a reliable two-device call is achieved within two founder-days.
3. If a concrete blocker prevents that, use Daily Prebuilt for the first 20 sessions behind the same provider-neutral adapter.
4. Keep Zoom or Google Meet only as an operational fallback.
5. Do not self-host or build raw WebRTC during MVP validation.

This path is easy enough for the MVP, demonstrates the actual Flownic product rather than a generic call, and avoids making a future provider change equivalent to rewriting the business logic.

---

## 17. Current official references

Provider features and prices change. Re-check them when implementation begins and before committing to a paid plan.

### LiveKit

- [React components and prefabs](https://docs.livekit.io/reference/components/react/)
- [React component building blocks](https://docs.livekit.io/reference/components/react/concepts/building-blocks/)
- [PreJoin component](https://docs.livekit.io/reference/components/react/component/prejoin/)
- [Access tokens and grants](https://docs.livekit.io/frontends/reference/tokens-grants/)
- [Production authentication](https://docs.livekit.io/frontends/build/authentication/)
- [LiveKit Cloud pricing](https://livekit.com/pricing)
- [LiveKit Cloud billing model](https://docs.livekit.io/deploy/admin/billing/)

### Daily

- [Daily call modes: iframe and call-object modes](https://docs.daily.co/docs/daily-js/concepts/call-modes)
- [Daily React](https://docs.daily.co/docs/daily-react)
- [Daily audio-only guide](https://docs.daily.co/docs/guides/features/audio-only)
- [Daily recording](https://docs.daily.co/docs/guides/features/recording)
- [Daily video API pricing](https://www.daily.co/pricing/video-sdk/)

### Zoom

- [Zoom Video SDK](https://developers.zoom.us/docs/video-sdk/)
- [Zoom Video SDK pricing](https://zoom.us/pricing/developer)
- [Zoom Meeting SDK](https://developers.zoom.us/docs/meeting-sdk/)
- [Zoom Meeting SDK for web](https://developers.zoom.us/docs/meeting-sdk/web/)

### Google Meet

- [Google Meet SDK and API overview](https://developers.google.com/workspace/meet/overview)
- [Google Meet REST API overview](https://developers.google.com/workspace/meet/api/guides/overview)
- [Google Meet artifacts](https://developers.google.com/workspace/meet/api/guides/artifacts)
- [Google Meet space configuration and auto-artifacts](https://developers.google.com/workspace/meet/api/guides/meeting-spaces-configuration)

### Other alternatives

- [Whereby Embedded documentation](https://docs.whereby.com/)
- [Whereby pricing](https://whereby.com/information/pricing)
- [Jitsi iframe API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)
- [Jitsi React SDK](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-react-sdk/)

