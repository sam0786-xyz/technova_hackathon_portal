const fs = require('fs');
const path = require('path');

const SOURCE_DIRS = ['migrations', 'supabase/migrations'];
const TARGET_DIR = 'migration v2';

if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

let fileIndex = 1;

function convertPgToMysql(sql) {
    let converted = sql;

    // Remove setup schemas
    converted = converted.replace(/CREATE SCHEMA IF NOT EXISTS [a-zA-Z_]+;/gi, '');
    converted = converted.replace(/GRANT .* ON SCHEMA [a-zA-Z_]+ TO [a-zA-Z_]+;/gi, '');
    converted = converted.replace(/GRANT .* ON TABLE [a-zA-Z_.]+ TO [a-zA-Z_]+;/gi, '');

    // Common Types
    converted = converted.replace(/\buuid\b/gi, 'VARCHAR(36)');
    converted = converted.replace(/\btext\b/gi, 'TEXT');
    converted = converted.replace(/\btimestamp with time zone\b/gi, 'DATETIME');
    converted = converted.replace(/\btimestamp without time zone\b/gi, 'DATETIME');
    converted = converted.replace(/\bjsonb\b/gi, 'JSON');
    converted = converted.replace(/\bbigint\b/gi, 'BIGINT');
    converted = converted.replace(/\bboolean\b/gi, 'BOOLEAN');

    // Default UUIDs
    converted = converted.replace(/DEFAULT uuid_generate_v4\(\)/gi, 'DEFAULT (UUID())');
    converted = converted.replace(/DEFAULT gen_random_uuid\(\)/gi, 'DEFAULT (UUID())');

    // Default NOW()
    converted = converted.replace(/DEFAULT now\(\)/gi, 'DEFAULT CURRENT_TIMESTAMP');

    // Clean up functions and RLS policies (simple replace, complex ones might need manual review)
    // Removed RLS
    converted = converted.replace(/ALTER TABLE .* ENABLE ROW LEVEL SECURITY;/gi, '');
    converted = converted.replace(/CREATE POLICY ".*"/gi, '-- CREATE POLICY REMOVED: ');

    // Arrays (MySQL doesn't support arrays, defaulting to JSON)
    converted = converted.replace(/TEXT\[\]/gi, 'JSON');
    converted = converted.replace(/VARCHAR\(36\)\[\]/gi, 'JSON');
    
    // Auth specific (Supabase uses next_auth schema)
    converted = converted.replace(/next_auth\./gi, '');
    converted = converted.replace(/public\./gi, '');

    // Extensions & Triggers
    converted = converted.replace(/CREATE EXTENSION IF NOT EXISTS .*;/gi, '');

    return converted;
}

SOURCE_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));
        files.forEach(file => {
            const originalPath = path.join(dir, file);
            const content = fs.readFileSync(originalPath, 'utf8');
            const newContent = convertPgToMysql(content);
            
            // Rename file to maintain single sequence
            const newFileName = `${String(fileIndex).padStart(3, '0')}_${path.basename(file)}`;
            const destPath = path.join(TARGET_DIR, newFileName);
            
            fs.writeFileSync(destPath, newContent);
            console.log(`Converted: ${originalPath} -> ${destPath}`);
            fileIndex++;
        });
    }
});

console.log("Conversion complete!");
