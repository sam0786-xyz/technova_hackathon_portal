-- Update Game Drifters and Pixelance Club Members
-- Run this migration to sync member data from the spreadsheet

-- First, get the club IDs
DO $$
DECLARE
    game_drifters_id UUID;
    pixelance_id UUID;
BEGIN
    -- Get Game Drifters club ID
    SELECT id INTO game_drifters_id FROM clubs WHERE name = 'Game Drifters';
    
    -- Get Pixelance club ID  
    SELECT id INTO pixelance_id FROM clubs WHERE name = 'PiXelance';

    -- =============================================
    -- GAME DRIFTERS CLUB MEMBERS
    -- =============================================
    
    -- Clear existing Game Drifters members
    DELETE FROM club_members WHERE club_id = game_drifters_id;
    
    -- Insert new Game Drifters members
    INSERT INTO club_members (club_id, name, role, email, phone) VALUES
    (game_drifters_id, 'Adhyyan Sharma', 'Club Lead', '2022618081.adhyyan@ug.sharda.ac.in', '9103230071'),
    (game_drifters_id, 'Aarav Kashyap', 'Club Co-Lead', '2024468363.aarav@ug.sharda.ac.in', '7836809633'),
    (game_drifters_id, 'Harshit Singh', 'Club Coordinator', '2024266770.harshit@ug.sharda.ac.in', '8446270836'),
    (game_drifters_id, 'Siddhartha Singh', 'Club Coordinator', '2025449201.siddhartha@ug.sharda.ac.in', '8920204739'),
    (game_drifters_id, 'Tanushi Jain', 'Club Coordinator', '2024208053.tanushi@ug.sharda.ac.in', '7668829845'),
    (game_drifters_id, 'Sukaina Shakeel Ansari', 'Club Coordinator', '2023535845.sukaina@ug.sharda.ac.in', '7011373474'),
    (game_drifters_id, 'Anupam Vasudeva', 'Club Coordinator', '2025210859.anupam@ug.sharda.ac.in', '9007027918'),
    (game_drifters_id, 'Nikhil', 'Club Coordinator', '2024421849.nikhil@ug.sharda.ac.in', '9910975581');

    -- =============================================
    -- PIXELANCE CLUB MEMBERS
    -- =============================================
    
    -- Clear existing Pixelance members
    DELETE FROM club_members WHERE club_id = pixelance_id;
    
    -- Insert new Pixelance members
    INSERT INTO club_members (club_id, name, role, email, phone) VALUES
    (pixelance_id, 'Krishna Narula', 'Club Lead', '2023266720.krishna@ug.sharda.ac.in', '9997331111'),
    (pixelance_id, 'Abhijit Dutta', 'Club Co-Lead (Photography)', '2023208688.abhijit@ug.sharda.ac.in', '7042859781'),
    (pixelance_id, 'Madwesha R', 'Club Co-Lead (Videography)', '2024329571.madwesha@ug.sharda.ac.in', '9535730004'),
    (pixelance_id, 'Swastik Garg', 'Club Coordinator', '2024104542.swastik@ug.sharda.ac.in', '8448216642'),
    (pixelance_id, 'Rishiyendra Kumar', 'Club Coordinator', '2023366214.rishiyendra@ug.sharda.ac.in', '8797210305'),
    (pixelance_id, 'Shivansh Tiwari', 'Club Coordinator', '2023244282.shivansh@ug.sharda.ac.in', '8604994930'),
    (pixelance_id, 'Keshav Grover', 'Club Coordinator', '2024342368.keshav@ug.sharda.ac.in', '7017421718'),
    (pixelance_id, 'Sarthak Choudhary', 'Club Coordinator', '2024468475.sarthak@ug.sharda.ac.in', '9310871537'),
    (pixelance_id, 'Navya Tyagi', 'Club Coordinator', '2023511345.navya@ug.sharda.ac.in', '8130298483'),
    (pixelance_id, 'Christopher Yumnam', 'Club Coordinator', '2024341019.christopher@ug.sharda.ac.in', '8414040208'),
    (pixelance_id, 'Shakhawat Ansari', 'Club Coordinator', '2023208445.shakhawat@ug.sharda.ac.in', '8769798897'),
    (pixelance_id, 'Kavay Dahiya', 'Club Coordinator', '2024321299.kavay@ug.sharda.ac.in', '7988257180'),
    (pixelance_id, 'Daxita', 'Club Coordinator', '2024342783.daxita@ug.sharda.ac.in', '7835890360');

END $$;
