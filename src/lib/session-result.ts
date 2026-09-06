import { scoreSession } from "./scoring";
import type {
  GateAnswer,
  MatchResponse,
  RetryResponse,
  ScoringResult,
} from "@/types";

export interface PersistedSessionAssessment {
  completedAt: string | null;
  homeLanguage: string;
  ranTimeSeconds: number | null;
  ranTotalTaps: number | null;
  gateAnswers: GateAnswer[] | null;
  matchResponses: MatchResponse[] | null;
  retryResponses: RetryResponse[] | null;
}

export function getPersistedScoringResult(
  session: PersistedSessionAssessment
): ScoringResult | null {
  if (!session.completedAt) return null;

  return scoreSession({
    gateAnswers: session.gateAnswers ?? [],
    homeLanguage: session.homeLanguage,
    ranTimeSeconds: session.ranTimeSeconds ?? 10,
    ranTotalTaps: session.ranTotalTaps ?? 20,
    matchResponses: session.matchResponses ?? [],
    retryResponses: session.retryResponses ?? [],
  });
}
