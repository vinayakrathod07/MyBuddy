-- 11. Task Subtasks
CREATE TABLE task_subtasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Goal Milestones
CREATE TABLE goal_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Voice Interactions
CREATE TABLE voice_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    transcript TEXT,
    processing_status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. User Preferences
CREATE TABLE user_preferences (
    user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    theme TEXT DEFAULT 'light',
    reminder_preferences JSONB DEFAULT '{"email": true, "push": true, "lead_time": 30}',
    voice_preferences JSONB DEFAULT '{"auto_speak": false, "voice_id": "default"}',
    notification_preferences JSONB DEFAULT '{"timetable": true, "tasks": true}',
    privacy_preferences JSONB DEFAULT '{"share_analytics": false}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Audit Logs
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    safe_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own subtasks" ON task_subtasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own milestones" ON goal_milestones FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own voice logs" ON voice_interactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
