
## Adding ZAPIER_WEBHOOK_SECRET & Securing the Webhook

### Secret Value
The user has provided: `95e9c4b6-299f-45d2-9fb6-781655d7bd8b1b54707a-488f-4ed1-a809-31288c572a07`

This will be stored as `ZAPIER_WEBHOOK_SECRET` in the backend secrets vault.

### Code Change — 1 File

**`supabase/functions/zapier-purchase-webhook/index.ts`**

After the `req.method !== "POST"` check (around line 58), insert:

```typescript
// Authenticate the request
const ZAPIER_WEBHOOK_SECRET = Deno.env.get("ZAPIER_WEBHOOK_SECRET");
const incomingSecret = req.headers.get("x-webhook-secret");

if (!ZAPIER_WEBHOOK_SECRET || incomingSecret !== ZAPIER_WEBHOOK_SECRET) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
```

### What You Need to Do in Zapier

In your Zapier Webhook action, under **Headers**, add exactly:

| Key | Value |
|-----|-------|
| `x-webhook-secret` | `95e9c4b6-299f-45d2-9fb6-781655d7bd8b1b54707a-488f-4ed1-a809-31288c572a07` |

### No Database Changes Needed
