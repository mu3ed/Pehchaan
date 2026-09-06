import { describe, expect, it } from "vitest";
import { getPersistedScoringResult } from "./session-result";

describe("getPersistedScoringResult", () => {
  it("returns no result for an incomplete session", () => {
    expect(
      getPersistedScoringResult({
        completedAt: null,
        homeLanguage: "Urdu",
        ranTimeSeconds: null,
        ranTotalTaps: null,
        gateAnswers: [],
        matchResponses: [],
        retryResponses: [],
      })
    ).toBeNull();
  });

  it("rebuilds a completed bilingual result from persisted responses", () => {
    const result = getPersistedScoringResult({
      completedAt: "2026-09-03T10:20:08.714Z",
      homeLanguage: "Urdu",
      ranTimeSeconds: null,
      ranTotalTaps: null,
      gateAnswers: [],
      matchResponses: [],
      retryResponses: [],
    });

    expect(result?.barrierCategory).toBe("no_concerns");
    expect(result?.gateConcerns).toEqual({ vision: false, hearing: false });
    expect(result?.summary.wentWell.ur).toBeTruthy();
    expect(result?.summary.wentWell.en).toBeTruthy();
  });
});
