
# Setting Up ZAPIER_WEBHOOK_SECRET Authentication

## What This Does

Right now the `zapier-purchase-webhook` endpoint accepts any POST request — anyone who knows the URL could trigger a purchase email. Adding a shared secret means Zapier proves it's the real caller by including a secret header on every request, and the function rejects anything that doesn't match.

---

## Step 1 — Generate Your Secret (You Do This)

You need a strong random string. Here are two easy ways to make one:

**Option A — Use your browser console (fast):**
Open any browser tab, press F12, go to Console, and paste:
```
crypto.randomUUID() + crypto.randomUUID()
```
Copy the result (looks like: `a3f9b2c1-...-d4e8f5a6...`).

**Option B — Use a password manager** like 1Password or Bitwarden — generate a 40+ character random string. Save it somewhere safe (you'll paste it into Zapier too).

---

## Step 2 — Add the Secret to the Backend (I Do This)

After you confirm you have the secret value ready, I'll use the `add_secret` tool to prompt you to enter it under the name `ZAPIER_WEBHOOK_SECRET`. The backend stores it encrypted — it never appears in the code.

---

## Step 3 — Update the Webhook Function (I Do This)

I'll add a secret validation block at the top of `supabase/functions/zapier-purchase-webhook/index.ts`, right after the POST method check:

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

This rejects any request that doesn't include the matching header. No valid secret = instant 401, no email sent.

---

## Step 4 — Add the Secret Header in Zapier (You Do This)

In your Zapier Webhook action, under **Headers**, add:

| Key | Value |
|-----|-------|
| `x-webhook-secret` | *(your secret from Step 1)* |

That's it — Zapier will include this on every purchase trigger automatically.

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/zapier-purchase-webhook/index.ts` | Add secret header validation after POST check |

## No Database Changes Needed

This is purely a server-side secret check in the edge function — no migrations required.

---

## Ready to Start?

Once you have your secret string ready, say the word and I'll prompt you to enter it, then update the function code — both in one go.
