import { z } from "zod";
import { formats } from "@/content/site";

/**
 * The enquiry form's shape, shared by the browser and the route handler.
 *
 * Data protection is a hard requirement here, so this schema is as much a
 * boundary as a validator: there is deliberately no field for symptoms, a
 * diagnosis, medical history, a date of birth or an address. What is collected
 * is the minimum needed to ring somebody back.
 */
const formatIds = formats.map((format) => format.id) as [string, ...string[]];

const ukPhone = /^[+(]?[\d\s().-]{9,20}$/;

export const enquirySchema = z
  .object({
    format: z.enum(formatIds),
    name: z.string().trim().min(1, "Please tell her what to call you.").max(80),
    method: z.enum(["phone", "email"]),
    phone: z.string().trim().max(24).optional().or(z.literal("")),
    email: z.string().trim().max(120).optional().or(z.literal("")),
    discreet: z.string().trim().max(300).optional().or(z.literal("")),
    safeTimes: z.string().trim().max(120).optional().or(z.literal("")),
    note: z.string().trim().max(1200).optional().or(z.literal("")),
    concession: z.boolean().default(false),
    /** Honeypot. Real people never see it, so it must come back empty. */
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.method === "phone" && !ukPhone.test(value.phone ?? "")) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Please enter a phone number she can reach you on.",
      });
    }
    if (value.method === "email" && !z.email().safeParse(value.email ?? "").success) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Please enter an email address she can reply to.",
      });
    }
  });

export type Enquiry = z.infer<typeof enquirySchema>;

/** Field-by-field errors, in the order the fields appear. */
export type FieldErrors = Partial<Record<keyof Enquiry, string>>;

export function collectErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof Enquiry | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
