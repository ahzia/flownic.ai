import { validateBlueprintFile } from "../src/server/services/blueprint";

const { blueprint, hash } = validateBlueprintFile();
console.log(
  JSON.stringify(
    {
      ok: true,
      trackSlug: blueprint.trackSlug,
      version: blueprint.version,
      status: blueprint.status,
      contentHash: hash,
    },
    null,
    2,
  ),
);
