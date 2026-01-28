-- Query untuk melihat semua user
SELECT 
    id,
    email,
    username,
    role,
    created_at,
    updated_at
FROM "User"
ORDER BY created_at DESC;
