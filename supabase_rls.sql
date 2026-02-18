-- Enable RLS on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dream" ENABLE ROW LEVEL SECURITY;

-- Create policies for User table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON "User" 
FOR SELECT 
USING (auth.uid() = id::uuid);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON "User" 
FOR UPDATE 
USING (auth.uid() = id::uuid);

-- Create policies for Dream table
-- Users can view their own dreams
CREATE POLICY "Users can view own dreams" 
ON "Dream" 
FOR SELECT 
USING (auth.uid() = "userId"::uuid);

-- Users can insert their own dreams
CREATE POLICY "Users can insert own dreams" 
ON "Dream" 
FOR INSERT 
WITH CHECK (auth.uid() = "userId"::uuid);

-- Users can update their own dreams
CREATE POLICY "Users can update own dreams" 
ON "Dream" 
FOR UPDATE 
USING (auth.uid() = "userId"::uuid);

-- Users can delete their own dreams
CREATE POLICY "Users can delete own dreams" 
ON "Dream" 
FOR DELETE 
USING (auth.uid() = "userId"::uuid);
