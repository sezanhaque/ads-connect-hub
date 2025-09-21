-- Create organization and membership for existing user who signed up before fix
DO $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
BEGIN
    -- Get the user_id for the existing user
    SELECT user_id INTO v_user_id 
    FROM profiles 
    WHERE email = 'moalamin001@gmail.com';
    
    -- Only proceed if user exists and doesn't have organization membership
    IF v_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM members WHERE user_id = v_user_id) THEN
        -- Create organization
        INSERT INTO organizations (name) 
        VALUES ('Md. Al Amin''s Organization') 
        RETURNING id INTO v_org_id;
        
        -- Add user as member
        INSERT INTO members (org_id, user_id, role) 
        VALUES (v_org_id, v_user_id, 'member');
    END IF;
END $$;