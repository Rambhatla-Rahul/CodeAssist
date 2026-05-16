-- Call logs table schema
-- Records detailed information about each call session including participants, duration, and quality metrics

CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  caller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  callee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time))
  ) STORED,
  call_type VARCHAR(20) CHECK (call_type IN ('audio', 'video', 'screen_share')),
  status VARCHAR(20) CHECK (status IN ('initiated', 'ringing', 'connected', 'completed', 'missed', 'failed')),
  sfu_used BOOLEAN DEFAULT FALSE,
  ice_candidates JSONB,
  sdp_offer TEXT,
  sdp_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_call_logs_session_id ON call_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_caller_id ON call_logs(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_callee_id ON call_logs(callee_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_start_time ON call_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);

-- Foreign key constraints are defined inline with the column definitions