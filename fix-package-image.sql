-- Fix the broken image URL for package 4 (Culture and Heritage Sri Lanka in 6 Days)
-- The current URL from sanishtech.com is not loading

UPDATE packages 
SET image_urls = '["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"]' 
WHERE package_id = 'pkg_004';

-- Alternative working URLs if the above doesn't work:
-- Option 1: Sigiriya Rock (Cultural heritage theme)
-- '["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"]'

-- Option 2: Temple of Tooth Kandy
-- '["https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800"]'

-- Option 3: Ancient ruins
-- '["https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800"]'
