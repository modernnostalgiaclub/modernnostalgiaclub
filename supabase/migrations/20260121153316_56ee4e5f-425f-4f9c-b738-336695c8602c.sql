-- Create chat_messages table for real-time group chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.community_sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Block anonymous access
CREATE POLICY "Block anonymous access to chat messages"
ON public.chat_messages
AS RESTRICTIVE
FOR ALL
USING (false);

-- Authenticated users can view all messages
CREATE POLICY "Authenticated users can view chat messages"
ON public.chat_messages
FOR SELECT
USING (true);

-- Users can create their own messages
CREATE POLICY "Users can create chat messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own messages
CREATE POLICY "Users can update their own chat messages"
ON public.chat_messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own chat messages"
ON public.chat_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Admins and moderators can manage all messages
CREATE POLICY "Admins and moderators can manage chat messages"
ON public.chat_messages
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Create index for fast channel queries
CREATE INDEX idx_chat_messages_channel_created ON public.chat_messages(channel_id, created_at DESC);

-- Create index for mentions queries
CREATE INDEX idx_chat_messages_mentions ON public.chat_messages USING GIN(mentions);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;