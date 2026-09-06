// Scoring thresholds — tunable constants.
// These can be adjusted during testing to calibrate classifications.

// RAN timing thresholds (seconds for 20 items)
export const RAN_FAST_THRESHOLD = 15; // below this = fast
export const RAN_SLOW_THRESHOLD = 25; // above this = slow

// Error rate thresholds per channel (0.0 to 1.0)
export const CHANNEL_ERROR_THRESHOLD = 0.4; // above this = elevated
export const CHANNEL_LOW_THRESHOLD = 0.2; // below this = low

// Teach-response classification
export const TEACH_FULL_RATIO = 1.0; // all retry items correct
export const TEACH_PARTIAL_RATIO = 0.5; // at least half correct

// Language-mismatch: if home language is not Urdu AND all channels are elevated
export const LANGUAGE_ALL_CHANNELS_THRESHOLD = 0.25;

// Control error rate above this suggests attention/comprehension issues
export const CONTROL_ERROR_THRESHOLD = 0.3;
