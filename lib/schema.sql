-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table to store user information
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Hashed password
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Models table to store AI model information
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- e.g., 'anthropic', 'openai', 'mistral', etc
  version TEXT NOT NULL,
  description TEXT,
  capabilities JSONB, -- Store model capabilities as JSON
  context_length INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, name, version)
);

-- Conversations table to store chat sessions
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  model_id UUID NOT NULL REFERENCES models(id),
  system_prompt TEXT,
  temperature NUMERIC DEFAULT 0.7,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table to store individual messages in conversations
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  tokens_input INTEGER,
  tokens_output INTEGER,
  latency_ms INTEGER,
  parent_message_id UUID REFERENCES messages(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files table to store file information
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message_files junction table for message attachments
CREATE TABLE message_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, file_id)
);

-- Artifacts table to store code snippets, visualizations, etc.
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g., 'code', 'mermaid', 'svg', 'html', 'markdown'
  title TEXT,
  content TEXT NOT NULL,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  keyboard_shortcuts JSONB DEFAULT '{}',
  default_model_id UUID REFERENCES models(id),
  default_temperature NUMERIC DEFAULT 0.7,
  default_system_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys for developer access
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- Store only the hash, not the raw key
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  estimated_cost NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users table policies
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Conversations table policies
CREATE POLICY conversations_select_own ON conversations
  FOR SELECT USING (auth.uid() = user_id OR is_shared = TRUE);
CREATE POLICY conversations_insert_own ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY conversations_update_own ON conversations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY conversations_delete_own ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages table policies
CREATE POLICY messages_select_conversation ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_id = auth.uid() OR conversations.is_shared = TRUE)
    )
  );
CREATE POLICY messages_insert_conversation ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create real-time subscriptions (Supabase specific)
-- This creates a publication for real-time changes
CREATE PUBLICATION supabase_realtime FOR TABLE conversations, messages;

-- Functions for common operations
-- Function to create a new conversation
CREATE OR REPLACE FUNCTION create_conversation(
  p_user_id UUID,
  p_model_id UUID,
  p_title TEXT DEFAULT NULL,
  p_system_prompt TEXT DEFAULT NULL,
  p_temperature NUMERIC DEFAULT 0.7
) RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  INSERT INTO conversations (
    user_id,
    model_id,
    title,
    system_prompt,
    temperature
  ) VALUES (
    p_user_id,
    p_model_id,
    COALESCE(p_title, 'New conversation'),
    p_system_prompt,
    p_temperature
  ) RETURNING id INTO v_conversation_id;
  
  -- Add system message if system prompt is provided
  IF p_system_prompt IS NOT NULL THEN
    INSERT INTO messages (
      conversation_id,
      role,
      content
    ) VALUES (
      v_conversation_id,
      'system',
      p_system_prompt
    );
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a message to a conversation
CREATE OR REPLACE FUNCTION add_message(
  p_conversation_id UUID,
  p_role TEXT,
  p_content TEXT,
  p_parent_message_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
  v_user_id UUID;
BEGIN
  -- Check if the user owns this conversation
  SELECT user_id INTO v_user_id FROM conversations
  WHERE id = p_conversation_id;
  
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to add messages to this conversation';
  END IF;

  -- Insert the message
  INSERT INTO messages (
    conversation_id,
    role,
    content,
    parent_message_id,
    metadata
  ) VALUES (
    p_conversation_id,
    p_role,
    p_content,
    p_parent_message_id,
    p_metadata
  ) RETURNING id INTO v_message_id;
  
  -- Update the conversation's last_message_at timestamp
  UPDATE conversations
  SET last_message_at = NOW(), updated_at = NOW()
  WHERE id = p_conversation_id;
  
  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a shareable conversation link
CREATE OR REPLACE FUNCTION share_conversation(
  p_conversation_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_share_token TEXT;
  v_user_id UUID;
BEGIN
  -- Check if the user owns this conversation
  SELECT user_id INTO v_user_id FROM conversations
  WHERE id = p_conversation_id;
  
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to share this conversation';
  END IF;
  
  -- Generate a secure random token
  v_share_token := encode(gen_random_bytes(16), 'hex');
  
  -- Update the conversation
  UPDATE conversations
  SET is_shared = TRUE,
      share_token = v_share_token
  WHERE id = p_conversation_id;
  
  RETURN v_share_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;