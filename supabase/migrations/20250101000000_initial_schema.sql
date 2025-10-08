-- 创建用户资料表
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  credits INTEGER DEFAULT 2 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 启用行级安全策略
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能读取自己的资料
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 用户可以更新自己的资料（但不包括积分，积分只能通过特定函数修改）
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 创建触发器函数：新用户注册时自动创建资料并分配积分
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, credits)
  VALUES (NEW.id, NEW.email, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 创建更新时间戳触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 user_profiles 表添加更新时间戳触发器
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 创建消费积分的函数
CREATE OR REPLACE FUNCTION public.consume_credit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- 获取当前积分并锁定行
  SELECT credits INTO current_credits
  FROM public.user_profiles
  WHERE id = user_id
  FOR UPDATE;

  -- 检查是否有足够积分
  IF current_credits < 1 THEN
    RETURN FALSE;
  END IF;

  -- 扣除积分
  UPDATE public.user_profiles
  SET credits = credits - 1
  WHERE id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建充值积分的函数
CREATE OR REPLACE FUNCTION public.add_credits(user_id UUID, amount INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_profiles
  SET credits = credits + amount
  WHERE id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建视频处理记录表
CREATE TABLE IF NOT EXISTS public.video_processes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  original_link TEXT NOT NULL,
  processed_url TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- 启用行级安全策略
ALTER TABLE public.video_processes ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的处理记录
CREATE POLICY "Users can view own video processes"
  ON public.video_processes
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的处理记录
CREATE POLICY "Users can insert own video processes"
  ON public.video_processes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的处理记录
CREATE POLICY "Users can update own video processes"
  ON public.video_processes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
