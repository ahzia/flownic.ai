import {
  validateIntake,
  type IntakeInput,
  type IntakeResult,
} from "@/domain/booking/intake";
import type { CommandResult } from "@/shared/errors/command-result";

/**
 * Intake command entrypoint. Persistence against Supabase will be added once
 * auth + migrations are configured for the environment.
 */
export function submitIntake(raw: unknown): CommandResult<IntakeResult> {
  return validateIntake(raw);
}

export type { IntakeInput, IntakeResult };
