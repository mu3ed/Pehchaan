import { describe, expect, it } from "vitest";
import { STRINGS, translate } from "./strings";

describe("translation catalog", () => {
  it("defaults the About label to Urdu", () => {
    expect(translate("nav.about", "ur")).toBe(STRINGS["nav.about"].ur);
  });

  it("selects English when explicitly requested", () => {
    expect(translate("nav.about", "en")).toBe("About Pehchaan");
  });

  it("interpolates variables in localized copy", () => {
    expect(translate("gate.question.vision", "en", { firstName: "Ali" })).toContain("Ali");
  });

  it("falls back safely for missing keys", () => {
    expect(translate("missing.key", "ur")).toBe("missing.key");
  });
});
