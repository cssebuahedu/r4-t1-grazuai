import { describe, expect, it } from "vitest";
import { noAssessmentReply, respond, unsupportedReply, type AssistantContext } from "@/lib/assistant";
import { useUseCases } from "@/lib/use-cases";
import { findings } from "@/lib/devsecops";
import { renderHook } from "@testing-library/react";
const product = renderHook(() => useUseCases()).result.current[0]!;
const ctx: AssistantContext = { product, findings: findings.filter((f) => f.repoId === "repo-001") };
describe("scripted assistant", () => {
  it("answers unsupported questions with the demo notice", () => expect(respond("cuaca hari ini?", ctx).text).toBe(unsupportedReply));
  it("says no assessment exists when none is available", () => expect(respond("Apa saja kontrol kepatuhan yang perlu diperbaiki?", ctx).text).toBe(noAssessmentReply));
  it("mentions the product's prompt injection finding", () => expect(respond("Bagaimana cara mengatasi prompt injection?", ctx).text).toContain("F-1001"));
  it("is deterministic", () => expect(respond("Apa saja sembilan nilai etika AI di Indonesia?", ctx)).toEqual(respond("Apa saja sembilan nilai etika AI di Indonesia?", ctx)));
});
