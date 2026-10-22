import type { IntakeFieldKey, IntakeFieldValue } from "@/lib/intake-types";
import { sanitizeClientInput } from "./sanitize";
import type { SecureClientInput } from "./types";

const SECURE_KEYS: IntakeFieldKey[] = [
  "displayName",
  "productCode",
  "amount",
  "expiryDate",
  "contactNotes",
  "dob",
];

export function intakeFieldsToSecureInput(
  fields: Record<IntakeFieldKey, IntakeFieldValue>
): SecureClientInput {
  return sanitizeClientInput({
    displayName: fields.displayName.value,
    clientCode: fields.productCode.value,
    productName: fields.productCode.value,
    expiryDate: fields.expiryDate.value,
    amount: fields.amount.value,
    notes: fields.contactNotes.value,
    birthdayMmDd: fields.dob.value,
  });
}

export function isSecureIntakeField(key: IntakeFieldKey): boolean {
  return SECURE_KEYS.includes(key);
}

export const SECURE_INTAKE_FIELD_KEYS = SECURE_KEYS;
