# Architecture decision records

Record material changes that diverge from, or lock in, decisions in the technical
requirements. Cursor must not silently change scope, providers, core domain states,
authorization rules, or retention behavior.

## When to add an ADR

- Current code already has a safer working solution than the spec
- A provider limitation forces a different approach
- Pilot evidence requires different behavior
- Founders approve a documented tradeoff

## Naming

`NNNN-short-kebab-title.md` (e.g. `0001-livekit-cloud-prefabs.md`)

## Template

```md
# Title

- Status: proposed | accepted | superseded
- Date: YYYY-MM-DD
- Deciders: …

## Context

## Decision

## Consequences

## Alternatives considered
```
