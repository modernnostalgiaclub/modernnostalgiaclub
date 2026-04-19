-- Enable RLS on realtime.messages and scope channel subscriptions
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can subscribe to own notification channel" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can subscribe to chat channels" ON realtime.messages;

-- Allow users to subscribe ONLY to their own notifications:<user_id> topic
CREATE POLICY "Users can subscribe to own notification channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'notifications:' || auth.uid()::text
);

-- Allow authenticated users to subscribe to chat channel topics.
-- Underlying chat_messages table RLS still governs which row data is delivered.
CREATE POLICY "Authenticated users can subscribe to chat channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE 'chat-%'
);