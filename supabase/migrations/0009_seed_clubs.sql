-- Seed Clubs Data
INSERT INTO public.clubs (name, description, logo_url)
VALUES 
    ('Technova Main', 'The central student society of Technova, overseeing all technical clubs and major events.', '/assets/logo/technova.png'),
    ('AI & Robotics', 'Innovating the future with Intelligence. Exploring AI, Machine Learning, and Robotics.', '/assets/logo/AI_&_Robotics_logo.png'),
    ('AWS Cloud', 'Building on the Cloud, for the World. Mastering AWS services and serverless architecture.', '/assets/logo/awscc.png'),
    ('CyberPirates', 'Guide individuals about Information security and cyber awareness to arm against modern exploits.', '/assets/logo/cyberpirates.png'),
    ('Datapool', 'Focusing on data insights, Database Management Systems, and languages like MySQL.', '/assets/logo/datapool.png'),
    ('Game Drifters', 'A community for exploring and developing new games. Connect, share, and build.', '/assets/logo/Game Drifters.png'),
    ('GDG on Campus', 'Google Developer Group. Peer-to-peer learning to build solutions for local communities.', '/assets/logo/gdg_on_campus.jpg'),
    ('GitHub Club', 'Promotes open-source contribution and technical skills. A community for developers.', '/assets/logo/github.png'),
    ('Pixelance', 'For photography/videography enthusiasts to share passion and explore new subjects.', '/assets/logo/pixelance_logo.png')
ON CONFLICT (name) DO NOTHING;
