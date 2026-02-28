import { z } from 'zod';

// Common validation patterns
const sanitizeString = (str: string) => str.trim().replace(/[<>]/g, '');

// Submission types as const for type safety
const SUBMISSION_TYPES = ['sync-review', 'catalog-audit', 'branding', 'project-proposal', 'audio-mission', 'producer-mission'] as const;
type SubmissionType = typeof SUBMISSION_TYPES[number];

// Profile form validation
export const profileFormSchema = z.object({
  full_name: z.string().trim().max(100, "Name must be less than 100 characters").optional().transform(val => val ? sanitizeString(val) : val),
  stage_name: z.string().trim().max(100, "Stage name must be less than 100 characters").optional().transform(val => val ? sanitizeString(val) : val),
  pro: z.string().max(50).optional(),
  has_publishing_account: z.boolean().default(false),
  publishing_company: z.string().trim().max(200, "Company name must be less than 200 characters").optional().transform(val => val ? sanitizeString(val) : val),
  writer_ipi: z.string().trim().regex(/^(\d{9,11})?$/, "IPI must be 9-11 digits").optional().transform(val => val || undefined),
  publisher_ipi: z.string().trim().regex(/^(\d{9,11})?$/, "IPI must be 9-11 digits").optional().transform(val => val || undefined),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

// Submission form validation
export const submissionFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters").transform(sanitizeString),
  submission_type: z.string().refine(
    (val): val is SubmissionType => SUBMISSION_TYPES.includes(val as SubmissionType),
    { message: "Please select a submission type" }
  ),
  disco_url: z.string().trim().url("Please enter a valid URL").max(500, "URL is too long"),
  notes: z.string().trim().max(2000, "Notes must be less than 2000 characters").optional().transform(val => val ? sanitizeString(val) : val),
});

export type SubmissionFormData = z.infer<typeof submissionFormSchema>;

// Community post validation
export const communityPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters").transform(sanitizeString),
  content: z.string().trim().min(1, "Content is required").max(10000, "Content is too long"),
});

export type CommunityPostData = z.infer<typeof communityPostSchema>;

// Community comment validation
export const communityCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(5000, "Comment is too long"),
});

export type CommunityCommentData = z.infer<typeof communityCommentSchema>;

// Helper to extract validation errors from zod result
export function getValidationErrors<T extends Record<string, unknown>>(
  result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }
): Partial<Record<keyof T, string>> {
  if (result.success || !result.error) return {};
  
  const errors: Partial<Record<keyof T, string>> = {};
  result.error.issues.forEach(issue => {
    const path = issue.path[0];
    if (path !== undefined && (typeof path === 'string' || typeof path === 'number')) {
      errors[String(path) as keyof T] = issue.message;
    }
  });
  return errors;
}
