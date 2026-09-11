import type * as React from 'npm:react@18.3.1'
import { template as purchaseAlert } from './purchase-alert.tsx'
import { template as formSubmissionAlert } from './form-submission-alert.tsx'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'purchase-alert': purchaseAlert,
  'form-submission-alert': formSubmissionAlert,
}
