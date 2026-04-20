-- Enable RLS on realtime.messages (Supabase Realtime authorization)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can subscribe to own notification channel" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can subscribe to chat channels" ON realtime.messages;

-- Allow users to receive realtime events only on their own notifications channel
-- Channel topic format used by client: `notifications:${user.id}`
CREATE POLICY "Users can subscribe to own notification channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'notifications:' || auth.uid()::text
);

-- Allow authenticated users to subscribe to community chat channels
-- (chat_messages RLS already restricts row visibility to authenticated users)
CREATE POLICY "Authenticated users can subscribe to chat channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE 'chat:%'
  OR realtime.topic() LIKE 'community:%'
);