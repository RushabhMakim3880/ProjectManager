import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.join(__dirname, '..');
const schemaPath = path.resolve(backendRoot, 'prisma/schema.prisma');
const databaseUrl = process.env.DATABASE_URL || '';

if (!fs.existsSync(schemaPath)) {
    console.error(`Schema not found at ${schemaPath}`);
    process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    console.log('PostgreSQL detected. Updating Prisma provider...');
    schema = schema.replace(/provider = "sqlite"/g, 'provider = "postgresql"');
} else if (databaseUrl.startsWith('file:')) {
    console.log('SQLite detected. Ensuring provider is sqlite...');
    schema = schema.replace(/provider = "postgresql"/g, 'provider = "sqlite"');
} else {
    console.log('No specific protocol detected or DATABASE_URL is empty. Keeping current provider.');
}

fs.writeFileSync(schemaPath, schema);
console.log('Prisma schema updated successfully.');
