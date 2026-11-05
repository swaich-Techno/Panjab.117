import { fatehgarhSahibParliamentaryGroup } from "@/data/fatehgarh-sahib";

import {
  getPartyCategory,
  otherPartyChoiceIds,
  type OtherPartyChoiceId,
  type PartyCategoryId,
} from "./parties";
import { registrationPilotPolicy } from "./policy";

export type SyntheticRegistrationAttempt = {
  synthetic: true;
  idempotencyKey: string;
  syntheticParticipantHash: string;
  assemblyConstituencyId: number;
  categoryId: PartyCategoryId;
  otherPartyChoiceId?: OtherPartyChoiceId;
  consent: {
    registration: true;
    politicalOpinion: true;
    version: string;
  };
};

export type RegistrationOutcome =
  | {
      status: "confirmed" | "idempotent_replay";
      registrationId: string;
      confirmedCount: number;
    }
  | {
      status:
        | "capacity_reached"
        | "duplicate"
        | "category_disabled"
        | "emergency_stop"
        | "invalid";
      message: string;
      confirmedCount: number;
    };

type StoredRegistration = {
  registrationId: string;
  attemptFingerprint: string;
  attempt: SyntheticRegistrationAttempt;
  status: "confirmed" | "withdrawn";
};

export type WithdrawalOutcome =
  | { status: "withdrawn" | "already_withdrawn"; releasedCapacity: boolean }
  | { status: "not_found" | "verification_required"; releasedCapacity: false };

type CapacityServiceOptions = {
  capacityPerTopLevelCategory?: number;
  emergencyStop?: boolean;
  beforeCommit?: (attempt: SyntheticRegistrationAttempt) => Promise<void>;
};

const allowedSegments = new Set<number>(
  fatehgarhSahibParliamentaryGroup.assemblyConstituencyNumbers,
);

function fingerprint(attempt: SyntheticRegistrationAttempt): string {
  return JSON.stringify({
    syntheticParticipantHash: attempt.syntheticParticipantHash,
    assemblyConstituencyId: attempt.assemblyConstituencyId,
    categoryId: attempt.categoryId,
    otherPartyChoiceId: attempt.otherPartyChoiceId ?? null,
    consent: attempt.consent,
  });
}

function isSyntheticIdentifier(value: string): boolean {
  return /^synthetic-[a-z0-9-]{6,120}$/.test(value);
}

export class SyntheticRegistrationCapacityService {
  readonly #capacityPerTopLevelCategory: number;
  readonly #beforeCommit?: (
    attempt: SyntheticRegistrationAttempt,
  ) => Promise<void>;
  #emergencyStop: boolean;
  #queue: Promise<void> = Promise.resolve();
  #sequence = 0;
  readonly #registrations = new Map<string, StoredRegistration>();
  readonly #idempotencyIndex = new Map<string, string>();
  readonly #participantIndex = new Map<string, string>();

  constructor(options: CapacityServiceOptions = {}) {
    const capacity =
      options.capacityPerTopLevelCategory ??
      registrationPilotPolicy.capacity.maximumConfirmedPerTopLevelCategory;
    if (!Number.isSafeInteger(capacity) || capacity < 1) {
      throw new Error("Registration capacity must be a positive integer.");
    }
    this.#capacityPerTopLevelCategory = capacity;
    this.#emergencyStop =
      options.emergencyStop ?? registrationPilotPolicy.emergencyStopActive;
    this.#beforeCommit = options.beforeCommit;
  }

  setEmergencyStop(active: boolean): void {
    this.#emergencyStop = active;
  }

  confirmedCount(categoryId: PartyCategoryId): number {
    let count = 0;
    for (const registration of this.#registrations.values()) {
      if (
        registration.status === "confirmed" &&
        registration.attempt.categoryId === categoryId
      ) {
        count += 1;
      }
    }
    return count;
  }

  async register(
    attempt: SyntheticRegistrationAttempt,
  ): Promise<RegistrationOutcome> {
    return this.#runExclusive(async () => {
      const currentCount = this.confirmedCount(attempt.categoryId);
      if (this.#emergencyStop) {
        return {
          status: "emergency_stop",
          message: "Synthetic registration is paused by the emergency stop.",
          confirmedCount: currentCount,
        };
      }

      const validationError = this.#validateAttempt(attempt);
      if (validationError) {
        return {
          status: "invalid",
          message: validationError,
          confirmedCount: currentCount,
        };
      }

      const existingId = this.#idempotencyIndex.get(attempt.idempotencyKey);
      if (existingId) {
        const existing = this.#registrations.get(existingId);
        if (!existing || existing.attemptFingerprint !== fingerprint(attempt)) {
          return {
            status: "invalid",
            message: "The idempotency key was reused with different data.",
            confirmedCount: currentCount,
          };
        }
        return {
          status: "idempotent_replay",
          registrationId: existing.registrationId,
          confirmedCount: this.confirmedCount(attempt.categoryId),
        };
      }

      if (this.#participantIndex.has(attempt.syntheticParticipantHash)) {
        return {
          status: "duplicate",
          message:
            "This synthetic participant already has a pilot registration.",
          confirmedCount: currentCount,
        };
      }

      const category = getPartyCategory(attempt.categoryId);
      if (!category.enabled) {
        return {
          status: "category_disabled",
          message: category.statusNote,
          confirmedCount: currentCount,
        };
      }

      if (currentCount >= this.#capacityPerTopLevelCategory) {
        return {
          status: "capacity_reached",
          message:
            "This pilot category has reached its confirmed-registration capacity.",
          confirmedCount: currentCount,
        };
      }

      await this.#beforeCommit?.(attempt);

      this.#sequence += 1;
      const registrationId = `synthetic-registration-${this.#sequence}`;
      const stored: StoredRegistration = {
        registrationId,
        attemptFingerprint: fingerprint(attempt),
        attempt,
        status: "confirmed",
      };
      this.#registrations.set(registrationId, stored);
      this.#idempotencyIndex.set(attempt.idempotencyKey, registrationId);
      this.#participantIndex.set(
        attempt.syntheticParticipantHash,
        registrationId,
      );

      return {
        status: "confirmed",
        registrationId,
        confirmedCount: currentCount + 1,
      };
    });
  }

  async withdraw(
    registrationId: string,
    verifiedSyntheticWithdrawal: boolean,
  ): Promise<WithdrawalOutcome> {
    return this.#runExclusive(async () => {
      const registration = this.#registrations.get(registrationId);
      if (!registration) {
        return { status: "not_found", releasedCapacity: false };
      }
      if (!verifiedSyntheticWithdrawal) {
        return { status: "verification_required", releasedCapacity: false };
      }
      if (registration.status === "withdrawn") {
        return { status: "already_withdrawn", releasedCapacity: false };
      }
      registration.status = "withdrawn";
      return { status: "withdrawn", releasedCapacity: true };
    });
  }

  #validateAttempt(attempt: SyntheticRegistrationAttempt): string | null {
    if (
      !isSyntheticIdentifier(attempt.idempotencyKey) ||
      !isSyntheticIdentifier(attempt.syntheticParticipantHash)
    ) {
      return "Only explicitly synthetic identifiers are accepted.";
    }
    if (!allowedSegments.has(attempt.assemblyConstituencyId)) {
      return "The Assembly constituency is outside the nine-segment pilot.";
    }
    if (
      !attempt.consent.registration ||
      !attempt.consent.politicalOpinion ||
      !attempt.consent.version
    ) {
      return "Separate registration and political-opinion consent is required.";
    }
    if (
      attempt.categoryId === "others" &&
      (!attempt.otherPartyChoiceId ||
        !otherPartyChoiceIds.includes(attempt.otherPartyChoiceId))
    ) {
      return "A specific choice is required under Other parties and independents.";
    }
    if (
      attempt.categoryId !== "others" &&
      attempt.otherPartyChoiceId !== undefined
    ) {
      return "Other-party choices may only be used with the Others category.";
    }
    return null;
  }

  async #runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.#queue;
    let release: () => void = () => undefined;
    this.#queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}
