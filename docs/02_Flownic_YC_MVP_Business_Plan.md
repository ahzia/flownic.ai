# Flownic YC MVP Business Plan

**Business-first scope, feature priorities, validation plan, and launch roadmap**

**Prepared for:** Ahmad Zia Yousufi and Ahmad Zamir Yousufi  
**Version:** 1.0  
**Date:** 27 July 2026  
**Status:** Execution document for the first narrow MVP  
**Companion to:** *Flownic Product Overview — Business Vision and MVP Guardrails*

---

## 1. Executive decision

Flownic's first MVP should prove one risky behavior:

> German B1 candidates will schedule, complete, and repeat a structured peer speaking session when AI makes the session easy to run and provides useful feedback afterward.

The MVP is not a smaller version of the full future platform. It is one complete loop for one exact exam track:

1. A candidate chooses a concentrated practice slot.
2. Flownic confirms a compatible peer.
3. The pair completes an AI-guided, role-specific speaking session.
4. Both users receive concise evidence-based feedback.
5. Each user can book another session immediately.

### Scope locks

| Decision | MVP choice |
|---|---|
| Initial customer | Adults preparing for a German B1 speaking exam within the next eight weeks |
| Working exam track | **telc Deutsch B1**, subject to one final format review with a qualified teacher before content is locked |
| Geography | Germany, beginning with the founders' NRW network and online German-learning communities |
| Core practice mode | Scheduled reciprocal peer session |
| AI's role | Guide the acting examiner/practice partner, create follow-ups, generate feedback, and rescue failed matches |
| Matching model | Fixed high-density slots plus concierge matching |
| Revenue test | One free useful session, followed by a €14.99 30-day founding Exam Sprint offer |
| Age policy | 18+ during the MVP |
| Expansion | No second exam, language, interview track, or marketplace before the narrow MVP passes its evidence gates |

### Recommended execution window

Based on the July 2026 application, the scheduling, session, role-switching, question-generation, and initial feedback flows already exist. From that documented baseline:

- **Pilot-ready product:** approximately 26–45 founder-days, or 3–5 calendar weeks with two technical founders working in parallel.
- **Credible business evidence:** approximately 4–6 weeks, because completed sessions and repeat behavior require real elapsed time.
- **If the current flow is only demo-level:** add 1–2 weeks for reliability, production deployment, and cross-browser testing.

The estimates in this document are planning ranges, not commitments. They include implementation, basic testing, deployment, and one correction pass, but not major redesigns.

---

## 2. What the MVP must prove to YC

YC does not need Flownic to support many exams. It needs evidence that the narrow product solves an urgent problem and produces behavior that can grow.

### The six MVP hypotheses

| Hypothesis | Fastest valid test | Promising evidence |
|---|---|---|
| **H1 — Demand:** candidates have an urgent partner-practice problem | Recruit only people with a known B1 exam date and ask them to commit to a slot | Qualified candidates book real sessions, not only join a waitlist |
| **H2 — Reliability:** strangers will attend and complete a scheduled practice session | Run fixed slots with confirmations and founder reminders | At least 80% show rate after operational improvements |
| **H3 — Differentiation:** the human peer adds value beyond an AI-only conversation | Let users experience or choose between peer and AI practice | At least 60% prefer peer practice when both are equally available |
| **H4 — Repeat use:** one session creates a reason to practise again | Show a next-practice recommendation and one-click rebooking | At least 40% book another session within seven days |
| **H5 — Feedback value:** the report changes what the user does next | Provide short evidence-linked feedback and interview users afterward | At least 80% rate the report useful; users can name a specific next action |
| **H6 — Willingness to pay:** useful practice supports a short exam product | Offer a real 30-day pass after the first useful report | At least three genuine purchases or a 15%+ conversion among eligible completers |

These are internal decision thresholds, not market benchmarks and not claims for the YC application until the results are real.

### Evidence YC is likely to value most

1. Completed peer sessions.
2. Users who book a second session.
3. Show-rate improvement after the founders fix no-shows.
4. Users choosing the peer experience over AI-only practice.
5. Actual payments.
6. Specific user statements explaining why the session was better than their existing preparation.
7. Weekly shipping based on observed session failures.

Waitlist size, generated questions, total features, social followers, and unverified AI scores are secondary.

---

## 3. Exact first customer

### Primary user

The first user should meet all of these conditions:

- Is at least 18 years old.
- Is preparing for one exact German B1 exam track.
- Has an exam date or intends to sit the exam within eight weeks.
- Can already study vocabulary, grammar, reading, and listening elsewhere.
- Needs realistic speaking repetitions with another person.
- Is willing to attend a scheduled online session.
- Can give feedback in German, English, or one of the founders' supported languages.

This is narrower than “people learning German.” That is intentional. A near-term exam creates urgency, a clear job to be done, and a reason to repeat.

### Initial positioning

> Flownic helps telc B1 candidates practise the speaking exam with a real peer. AI runs the format, guides the practice partner, and shows both candidates what to improve next.

### Users deliberately excluded from the first cohort

- Casual language learners without a near-term exam.
- Candidates for Goethe B1, DTZ, German B2, IELTS, or another track.
- Job-interview candidates.
- Schools requiring a dashboard, SSO, or procurement process.
- Minors.
- Users seeking instruction across the full language curriculum.
- Users seeking help during a real exam or interview.

### Important content decision

Before the final blueprint is coded, a qualified telc teacher or experienced examiner-preparation instructor should review:

- Whether the reciprocal role design faithfully practises the required interaction.
- Which participant is an examiner, interlocutor, or candidate during each task.
- The order, timing, instructions, and preparation rules.
- Which rubric dimensions can be assessed responsibly from a practice session.
- The wording needed to avoid implying official telc affiliation or official scoring.

If this review shows that the role-switch workflow materially reduces realism, the founders should adapt the interaction before launch—or select one better-fitting German B1 blueprint. They should not support several formats at once to avoid making the decision.

---

## 4. MVP customer experience

### The offer

The user receives:

- One exact speaking-practice format.
- A small set of recurring slots rather than unlimited availability.
- A confirmed peer with the same exam goal.
- A guided browser-based session with private role instructions.
- Timers, task stages, and a clear role switch.
- A small number of context-aware follow-up suggestions for the acting examiner or practice partner.
- A transcript-based report with strengths, evidence, corrections, and one recommended focus.
- Immediate rebooking.
- An AI examiner fallback if a peer does not attend.

### The critical journey

1. **Discover:** the candidate arrives through a teacher, community, classmate, or exam-specific post.
2. **Qualify:** the candidate enters the exact exam, exam date, timezone, and preferred fixed slot.
3. **Commit:** the user selects a slot and confirms attendance.
4. **Match:** the founders or a simple rule pair users manually.
5. **Remind:** both participants receive reminders and reconfirm.
6. **Join:** each user opens a unique session link.
7. **Practise:** role-specific screens guide the session without exposing hidden help to the candidate.
8. **Switch:** both participants receive value by completing the reciprocal round.
9. **Review:** each receives concise, carefully qualified feedback.
10. **Repeat:** the product recommends the next practice focus and offers a new fixed slot.
11. **Pay:** after receiving value, eligible users see the founding 30-day Exam Sprint offer.

### Definition of a “useful completed session”

A session counts toward the north-star metric only when:

- Both intended participants join, or the AI fallback successfully replaces the absent peer.
- The required practice stages finish.
- The reciprocal role switch finishes when the blueprint requires it.
- The feedback report is generated and opened.
- At least one participant rates the session useful or books another session.

This prevents the team from reporting scheduled calls or short connections as successful practice.

---

## 5. Feature-prioritization method

Every feature is evaluated on four dimensions:

- **YC importance:** how directly it proves demand, differentiation, retention, or payment.
- **User value:** how much it improves the candidate's immediate outcome.
- **Business-learning value:** how much it resolves a major business uncertainty.
- **Incremental effort:** estimated founder-days from the documented July 2026 baseline.

Scores use a 1–5 scale. A score of 5 means essential or directly evidence-producing. The ranking also considers dependencies; it is not a purely mathematical formula.

### Priority definitions

| Priority | Meaning |
|---|---|
| **P0 — Pilot required** | Must work before the MVP can produce trustworthy evidence |
| **P1 — Add after observed need** | Build only after the first 10–20 completed sessions reveal the bottleneck |
| **P2 — Explicitly later** | Valuable in the future, but harmful to MVP focus now |
| **Avoid** | Conflicts with positioning, safety, trust, or current business learning |

---

## 6. Ranked P0 feature plan

| Rank | Feature | YC importance | User value | Business-learning value | Current documented state | Incremental estimate | MVP decision |
|---:|---|:---:|:---:|:---:|---|---:|---|
| **1** | **One teacher-validated telc B1 interaction blueprint** | 5 | 5 | 5 | Questions and exam-format flow exist; exact validation is unclear | 2–4 days | Lock one version with original practice content and clear disclaimers |
| **2** | **Reliable peer session with private role-specific views** | 5 | 5 | 5 | Working session and role views are claimed | 3–5 days | Harden the unique product experience; candidate must never see private guidance |
| **3** | **Fixed-slot booking, confirmation, and joining** | 5 | 5 | 5 | Availability, scheduling, and invitations are claimed | 2–4 days | Optimize for three to five dense weekly slots, not flexible global matching |
| **4** | **Task orchestration, timers, and role switch** | 5 | 5 | 5 | Role switching exists; production reliability is unknown | 2–3 days | Make both rounds easy to understand and impossible to enter in the wrong state |
| **5** | **Funnel and session instrumentation** | 5 | 2 | 5 | Not confirmed | 1–2 days | Log every step and failure before the first real cohort |
| **6** | **Confirmation reminders, cancellation, and no-show states** | 5 | 5 | 5 | Not confirmed | 2–3 days | Use email or simple messaging; manual reminders are acceptable |
| **7** | **Concise evidence-based feedback report** | 5 | 5 | 5 | Initial feedback exists; calibration is in progress | 3–5 days | Give strengths, transcript evidence, two corrections, and one next-practice action |
| **8** | **One-click rebooking and next-session recommendation** | 5 | 4 | 5 | Not confirmed | 1–2 days | The product must directly measure repeat intent and behavior |
| **9** | **On-demand AI follow-up suggestion for the acting examiner** | 5 | 4 | 4 | Live follow-up assistance is in progress | 2–4 days | Start with a button or limited prompts; continuous real-time generation is unnecessary |
| **10** | **AI examiner fallback** | 4 | 5 | 4 | Planned or partially implemented | 3–5 days | Rescue an unmatched or failed peer session inside the same time window |
| **11** | **Lightweight exam intake** | 4 | 4 | 4 | Supabase and exam selection are planned or present | 1–2 days | Collect only exam, date, timezone, slot, feedback language, and consent |
| **12** | **Consent, leave, block, and report controls** | 3 | 5 | 4 | Not confirmed | 2–3 days | Required for live peer interaction; keep the pilot 18+ |
| **13** | **Founder operations view** | 4 | 2 | 5 | Not confirmed | 1–2 days | Show bookings, confirmations, links, attendance, reports, and failures; no large admin system |
| **14** | **Hosted payment link and manual entitlement** | 5 | 3 | 5 | No revenue; payment not confirmed | 0.5–1 day | Test a real €14.99 offer without building subscription infrastructure |

### P0 effort summary

The table totals approximately **26–45 founder-days** if every item needs the full listed work. Because several flows are already claimed as working and both founders can work in parallel, the expected calendar range is **3–5 weeks**.

The team should spend no more than one uninterrupted week building without running a real user session. Sessions should begin as soon as the first safe end-to-end path works.

### Why instrumentation ranks fifth

Analytics produces little direct user value, but without it the founders cannot distinguish:

- A demand problem from a scheduling problem.
- A scheduling problem from a no-show problem.
- A session-quality problem from a feedback problem.
- Curiosity from repeat behavior.
- Product revenue from friendly support or donations.

For a YC MVP, an unmeasured polished flow is weaker than a rough flow that produces reliable evidence.

---

## 7. P1 features: build only after sessions expose the need

| Rank | Feature | Trigger to build | Estimated effort | Value |
|---:|---|---|---:|---|
| **15** | Feedback-calibration workflow | Teachers disagree with reports or users fixate on scores | 3–5 days plus reviewer time | Improves trust and supports a paid report |
| **16** | Reliability score and replacement queue | No-shows remain above 20% after reminders | 3–5 days | Protects liquidity and urgent users |
| **17** | Rebook the same partner | Users explicitly request continuity | 2–3 days | Improves retention without new acquisition |
| **18** | Invite-a-classmate flow | Users have partners but still want structure and feedback | 1–2 days | Bypasses marketplace cold start and creates a growth loop |
| **19** | 30-day pass entitlements and usage limits | At least three users pay through the hosted link | 3–5 days | Converts a manual payment test into a repeatable offer |
| **20** | Basic session history and progress view | Repeat users cannot remember prior weaknesses | 2–4 days | Strengthens the short preparation sprint |
| **21** | Simple automated match suggestions | Founder matching consumes more than 3–4 hours per week | 4–7 days | Reduces operations after behavior is understood |
| **22** | Private cohort code for one school or teacher | A partner commits a real cohort | 2–4 days | Tests B2B distribution without an institution dashboard |
| **23** | Low-cost expert report review | Users ask for authoritative human feedback and will pay | 2–4 days plus expert operations | Creates a quality and revenue ladder |
| **24** | Audio-cost and model-cost controls | AI/media cost exceeds 25% of expected pass revenue | 2–4 days | Protects consumer gross margin |

P1 is not a promised second sprint. Each item requires the stated behavior or cost trigger.

---

## 8. P2 and excluded features

### Valuable later, but not part of the MVP

| Feature | Why it waits |
|---|---|
| Additional German exams | Splits scarce users and requires separate content validation |
| Other languages and global exams | Adds localization, moderation, distribution, and new liquidity problems |
| Job and admissions interview preparation | Attractive but crowded; it weakens the language-exam wedge before it is proven |
| Verified teacher/expert marketplace | Requires identity, supply, payouts, reviews, refunds, and support |
| Full school dashboard | Should follow a paid cohort commitment, not precede it |
| Native mobile apps | The browser flow is sufficient for the behavioral test |
| Sophisticated automated matching | Manual matching will reveal the correct rules first |
| Advanced pronunciation scoring | High trust and calibration cost; not essential to prove the peer loop |
| Large question bank | One high-quality, versioned blueprint is enough for the first sessions |
| Full language course | Competes with mature learning products and obscures the speaking-practice job |
| Gamification, streaks, badges, or currency | Does not resolve the urgent marketplace and repeat-use risks |
| Social feed, open chat, and discovery network | Creates moderation and distraction without proving exam practice |
| Complex subscriptions and billing | A payment link is enough to test willingness to pay |
| Enterprise integrations, SSO, or white-labeling | No committed institutional customer currently requires them |

### Avoid

- Official affiliation, official-score language, certification, or pass guarantees.
- Copied or leaked exam questions.
- Hidden assistance during a real exam or job interview.
- Recording without explicit consent.
- Public leaderboards based on uncalibrated language ability.
- Crypto or an internal currency.
- Broad “AI tutor for everything” positioning.

---

## 9. Business model for the MVP

### MVP offer structure

#### Free first session

Include:

- One reciprocal peer session.
- AI-guided session flow.
- Basic evidence-based report.
- One AI fallback if the scheduled peer is absent.

Purpose:

- Reduce adoption friction.
- Seed the two-sided network.
- Let the user experience the differentiated value before being asked to pay.

#### Founding Exam Sprint

**Price test:** €14.99 for 30 days.

MVP promise:

- Access to additional fixed peer slots, subject to availability.
- A limited number of AI fallback or immediate-practice sessions.
- Detailed reports and session history, delivered manually if needed.
- Priority help with rebooking.

This is a learning offer, not the final public package. Use a hosted checkout page and grant access manually.

### Payment sequence

1. The user finishes a useful free session.
2. The report shows one specific improvement area.
3. The product recommends a second session.
4. The user sees the 30-day offer.
5. The user either pays, declines with a short reason, or requests a different offer.

Do not ask only, “Would you pay?” A real payment is stronger evidence.

### Pricing experiment rules

- Begin with €14.99; do not run a statistical A/B test on a tiny cohort.
- If users value the product but do not buy, test the offer framing before immediately cutting the price.
- After at least ten eligible offers, test €9.99 or €19.99 sequentially if needed.
- Track refunds and usage cost from the first payment.
- Do not promise unlimited AI sessions before cost per session is known.

### What not to monetize yet

- A self-serve teacher marketplace.
- Annual plans.
- Feature-heavy freemium tiers.
- Advertising.
- Certificates.
- School contracts requiring custom engineering.

---

## 10. Go-to-market and marketplace cold start

### Launch cohort

Recruit one concentrated cohort:

- **Target:** 20–30 qualified telc B1 candidates.
- **Exam timing:** preferably sitting the exam within the next eight weeks.
- **Initial slots:** three to five recurring weekly times, concentrated on weekday evenings and weekend mornings.
- **Session supply:** founders, teachers, or reliable alumni can seed empty roles, but seeded sessions must be labeled internally so marketplace show-rate data remains honest.

### First acquisition channels

Ranked by likely speed and candidate quality:

1. The founders' German-course and exam-preparation contacts.
2. One or two independent German teachers who can refer an entire small group.
3. Local immigrant, integration-course, and professional-language communities in NRW.
4. Exam-specific WhatsApp, Telegram, Facebook, Discord, and Reddit communities, subject to group rules.
5. “Free telc B1 speaking mock day” events online.
6. Invite a classmate after a qualified candidate registers.

The founders should optimize for completed sessions per channel, not signups per channel.

### Concierge operating model

For the first 20–30 sessions, founders should manually:

- Verify that each participant fits the exam track.
- Select a small number of high-density slots.
- Pair participants.
- Confirm attendance 24 hours and two hours before the session.
- Maintain a replacement list.
- Monitor session failures.
- Review early AI reports before delivery.
- Conduct a ten-minute interview after selected sessions.
- Offer and record the payment test.

This manual work is part of the MVP. It teaches the rules that later automation should encode.

### Founder responsibilities

| Area | Primary owner | Supporting owner |
|---|---|---|
| Candidate recruitment and interviews | Zia | Zamir |
| Teacher/content-review relationship | Zia | Zamir |
| Session UI and role-state reliability | Zamir | Zia |
| AI follow-ups and feedback pipeline | Zia | Zamir |
| Scheduling, reminders, and operations view | Zamir | Zia |
| Metrics review and weekly decisions | Both | — |
| Live pilot support | Both | — |

---

## 11. Metrics and decision thresholds

### North-star metric

**Weekly completed useful practice sessions per active candidate.**

### Minimum event tracking

Track these events with a user, session, exam track, acquisition channel, and timestamp:

1. `qualified_signup`
2. `availability_submitted`
3. `session_scheduled`
4. `session_confirmed`
5. `session_joined`
6. `session_started`
7. `role_switched`
8. `session_completed`
9. `report_generated`
10. `report_opened`
11. `useful_rating_submitted`
12. `second_session_booked`
13. `ai_fallback_started`
14. `payment_offer_viewed`
15. `payment_completed`
16. `cancelled_or_no_show`

### Internal interpretation thresholds

| Metric | Weak signal | Promising signal | Strong signal |
|---|---:|---:|---:|
| Qualified signup → booked session | <40% | 40–64% | ≥65% |
| Confirmed participants who attend | <60% | 60–79% | ≥80% |
| Started sessions that finish required stages | <70% | 70–89% | ≥90% |
| Reciprocal sessions completing role switch | <75% | 75–89% | ≥90% |
| Users rating the session/report useful | <60% | 60–79% | ≥80% |
| Users booking again within 7 days | <20% | 20–39% | ≥40% |
| Users preferring peer when peer and AI are equally available | <40% | 40–59% | ≥60% |
| Eligible users buying the 30-day offer | <5% | 5–14% | ≥15% |
| Failed peer bookings rescued by AI fallback | <30% | 30–59% | ≥60% |

These thresholds are meant to force decisions. They should not be described publicly as industry standards.

### Suggested first-cohort target

| Funnel stage | Target |
|---|---:|
| Qualified candidates | 30 |
| Availability submissions | 20+ |
| Sessions scheduled | 15+ |
| Peer sessions completed | 10+ |
| Total useful sessions, including fallback | 12+ |
| Users booking a second session | 4+ |
| Genuine paid Exam Sprint purchases | 3+ |
| Teacher-reviewed session reports | 10 |

The application should report actual numbers, even if they are below these targets.

---

## 12. Four-week build-and-pilot plan, plus a two-day preflight

### Week 0 — Two-day scope and baseline audit

- Run the current MVP from booking through report on two browsers and two accounts.
- Label each P0 feature as working, partial, unstable, or missing.
- Lock the exact exam blueprint after a qualified content review.
- Define the event schema and successful-session criteria.
- Recruit the first ten candidates before additional product work expands.

**Output:** a tested baseline, one locked blueprint, first slots published, and a corrected effort forecast.

### Week 1 — Make the peer loop reliable

- Harden fixed-slot booking, confirmations, unique session links, and joining.
- Verify role privacy.
- Complete timers, stages, and role switching.
- Add session events, error logging, and the founder operations view.
- Run two to four founder-observed sessions.

**Output:** a new qualified candidate can finish the reciprocal session without normal-path founder intervention.

### Week 2 — Make the session useful and recoverable

- Improve the concise feedback report.
- Add the follow-up suggestion control.
- Add reminders, cancellations, and no-show handling.
- Add the minimal AI fallback.
- Add one-click rebooking, safety controls, and consent.
- Run five to ten sessions and interview users.

**Output:** the product survives predictable failure and creates a clear reason to repeat.

### Week 3 — Run the concentrated pilot

- Operate fixed slots.
- Review every funnel failure daily.
- Compare peer and AI-fallback usefulness.
- Have a qualified teacher review anonymized reports.
- Fix only the highest-frequency blocker.
- Begin showing the payment offer after useful reports.

**Output:** real show, completion, usefulness, repeat, and payment data.

### Week 4 — Produce business evidence

- Continue sessions long enough to measure seven-day rebooking.
- Test the €14.99 founding offer.
- Interview repeat users, non-repeat users, no-shows, and buyers.
- Calculate session cost and founder operations time.
- Record an updated product demo using a real, stable flow.
- Prepare a truthful YC traction update if the change is material.

**Output:** an evidence-backed decision to continue, change the operating model, change the exact exam track, or challenge the peer-practice thesis.

---

## 13. Initial technical boundaries

This document does not define the full architecture. The MVP should preserve the existing stack while reducing technical risk:

| Layer | MVP approach |
|---|---|
| Web application | Next.js and TypeScript; responsive browser experience |
| Data and authentication | Supabase/PostgreSQL; magic-link or similarly lightweight access |
| Audio/video | LiveKit/WebRTC, with a stable external-call fallback during the concierge stage |
| Session definition | One versioned JSON-like blueprint containing stages, roles, timers, prompts, and rubric references |
| Speech and AI | Speech-to-text for transcript; limited real-time or on-demand follow-ups; asynchronous feedback generation |
| Role privacy | Server-authorized role state; never rely only on hiding candidate content in the browser |
| Analytics | A small event table or managed analytics product with agreed event definitions |
| Notifications | Email first; manual messaging is acceptable for early pilots |
| Payments | Hosted payment link; manual entitlement |
| Admin | Minimal founder-only operations view; no generalized admin platform |

### Technical principles

- Prefer audio over video when video does not improve the exam simulation.
- Generate reports asynchronously if that makes the live session more stable.
- Use an on-demand follow-up button before building an always-listening AI agent.
- Save only the minimum recording and transcript data needed, with explicit consent and a clear deletion policy.
- Keep original practice content separate from model-generated variants.
- Record AI and media cost per completed session from the first pilot.
- Maintain an external-call fallback until the in-browser room is demonstrably reliable.

---

## 14. Launch gates

### Demo-ready

- One seeded pair can complete the full flow.
- Examiner and candidate screens are visibly different.
- The timer and role switch work.
- A transcript-based report is generated.
- The AI fallback can be shown briefly.

This is enough for a product demo, but it is not evidence that the business works.

### Pilot-ready

- A new user can book and join without founder explanation.
- Role-private data is protected.
- Consent, leave, block, and report controls work.
- Session and funnel events are captured.
- Reminders and no-show states work.
- The team has a support and replacement procedure.
- A qualified reviewer has approved the practice blueprint.

### Evidence-ready

- At least 20 useful sessions have been completed.
- Show rate is improving and understandable.
- At least 40% of users book another session, or the team can clearly explain a different strong retention behavior.
- Users can articulate why the peer layer matters.
- At least one genuine payment has occurred; three or more is a stronger signal.
- The team can name the top three failures and show the product changes made in response.

---

## 15. Risks, responses, and pivot signals

| Risk | Immediate response | Signal requiring a larger change |
|---|---|---|
| Too few compatible users per slot | Concentrate slots, recruit cohorts, allow classmate invitations, seed supply | Fewer than half of qualified candidates can be placed within 72 hours |
| High no-show rate | Reconfirmation, waitlist, reminders, reliability notes, AI rescue | Show rate remains below 60% after two operational iterations |
| Users dislike acting as examiner or switching roles | Simplify guidance, clarify learning benefit, test task-specific partner roles | Most completers refuse a second reciprocal session |
| Peer sessions are not more valuable than AI-only | Improve structure and matching; identify tasks where human interaction matters | After 30+ sessions, users consistently prefer AI-only and peer retention is below 20% |
| AI feedback is not trusted | Remove readiness scores, show evidence, add human review, state uncertainty | Qualified reviewers regularly identify harmful or misleading advice |
| telc B1 is difficult to recruit | Use teacher and community partners; test exact-channel messaging | Another single exam track produces materially denser qualified demand |
| Media reliability damages sessions | Use audio-first mode and an external-call fallback | More than 10% of sessions fail for technical reasons after hardening |
| The paid offer does not convert | Interview users; test paid trigger, packaging, and value before price | Users repeat frequently but no one pays after multiple offer iterations |
| Founder operations are too heavy | Track minutes per match and automate the repeated step only | Support time grows faster than completed sessions |

The objective is not to defend the original implementation. It is to determine whether the peer-plus-AI practice behavior is real and commercially useful.

---

## 16. Weekly founder review

Every week, the founders should answer:

1. How many qualified candidates joined?
2. How many booked, confirmed, attended, completed, and rebooked?
3. Why did each failed session fail?
4. What did repeat users say was uniquely valuable?
5. What did non-repeat users do instead?
6. How many users chose peer practice over AI-only practice?
7. Which feedback statement did a qualified reviewer disagree with?
8. Did anyone pay, request a refund, or reject the offer?
9. How much did one completed session cost in AI, media, and founder time?
10. What single product or operational change will be tested next week?

The team should avoid reviewing a large dashboard without listening to users. Early numbers identify where to investigate; interviews explain why.

---

## 17. YC evidence package

When the narrow MVP produces real usage, the founders should be able to state:

- The exact exam and user segment.
- Number of qualified users.
- Number of sessions scheduled and completed.
- Show and no-show rates.
- Percentage booking a second session.
- Percentage preferring peer practice to AI-only practice.
- Number of paying users and revenue.
- One concrete product change caused by user behavior.
- One sentence on the largest unresolved risk.

### Strong update format

> Since submitting, we narrowed Flownic to [exact exam]. [X] candidates have booked [Y] sessions, [Z] sessions were completed, and [R%] of completers booked another session within seven days. After no-shows caused [problem], we added [specific change], which changed the show rate from [A%] to [B%]. [P] users have paid [€ amount] for the 30-day pilot.

Only real, current, explainable numbers should be used.

---

## 18. Final MVP checklist

### Product

- [ ] One exact exam blueprint is locked and reviewed.
- [ ] Fixed-slot booking and confirmation work.
- [ ] A matched pair can join from separate devices.
- [ ] Role-specific guidance remains private.
- [ ] Tasks, timers, and role switching work.
- [ ] A limited AI follow-up can be requested.
- [ ] The transcript and concise report work.
- [ ] The AI fallback can rescue a failed peer session.
- [ ] Rebooking is one click.

### Safety and quality

- [ ] Pilot users are 18+.
- [ ] Recording/transcription consent is explicit.
- [ ] Leave, block, and report controls work.
- [ ] Data-retention language is visible.
- [ ] Feedback avoids official-score and pass-guarantee claims.
- [ ] A qualified reviewer has checked the blueprint and sample reports.

### Business

- [ ] At least 20–30 qualified candidates are being recruited into one cohort.
- [ ] Three to five concentrated weekly slots are published.
- [ ] The founder matching and replacement process is documented.
- [ ] Every funnel stage has a consistent definition.
- [ ] Post-session interviews are scheduled.
- [ ] The €14.99 hosted payment test is ready.
- [ ] AI, media, and founder time per session are tracked.

### YC

- [ ] The demo communicates the peer-plus-AI insight in under two minutes.
- [ ] Current traction numbers are truthful and reproducible.
- [ ] Scheduled sessions are not reported as completed sessions.
- [ ] Seeded/founder-run sessions are separated from organic peer sessions.
- [ ] Repeat behavior and payments are emphasized over feature count.

---

## 19. Final recommendation

Build no new expansion feature until the team has watched real candidates complete the narrow loop.

The correct first version is not:

> A multilingual AI platform for every exam and interview.

It is:

> The fastest reliable way for a telc B1 candidate to book a real speaking-practice partner, complete a structured AI-guided session, learn what to improve, and practise again.

If users repeatedly do that—and some pay—Flownic has the beginning of a company. If they do not, the founders will have learned which assumption failed without spending months building the future platform.

---

## Source basis

This execution plan was developed from:

- *Flownic Product Overview — Business Vision and MVP Guardrails*, version 1.0, 27 July 2026.
- *Flownic — YC Fall 2026 Finalized Application*.
- *YC Fall 2026 Application Playbook — Yousufi Founders*.
- *Flownic YC Fall 2026 Application Answer Workbook*.

The competitor and market research underlying the broader strategy remains in the product overview. This document intentionally converts that research into a narrow operating plan rather than repeating it.
