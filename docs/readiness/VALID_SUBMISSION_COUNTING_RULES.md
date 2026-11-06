# Valid submission counting rules

A response counts toward a segment target only when all of these remain true:

1. A raw request was successfully received under an authorized release.
2. The supported questionnaire and consent versions passed validation.
3. Civic consent and age/residence eligibility were recorded.
4. Exactly one eligible Assembly segment was selected.
5. The encrypted durable transaction committed with its audit/outbox event.
6. The response is not an idempotent replay, duplicate, invalid or excluded.
7. Required quality screening is complete.
8. The response has not been withdrawn or deleted.

Counters are separate:

- **raw receipt**: any intake request reaching the service;
- **accepted**: validated and durably committed for screening;
- **pending**: accepted but not finally screened;
- **valid retained eligible**: the only target numerator;
- **duplicate**: retained or suppressed according to approved policy, never
  counted valid automatically;
- **invalid**: failed content or eligibility validation;
- **withdrawn**: consent withdrawn and deletion workflow initiated/completed;
- **excluded**: removed by a documented methodology rule.

Counts must be derived from durable status history, not edited dashboard
numbers. Reclassification is transactional and auditable. A 500 result sets
`targetReached`; it does not close intake. The 501st, 750th and later eligible
submission remains acceptable while every launch control remains authorized.
