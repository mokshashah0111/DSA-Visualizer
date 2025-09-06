import { writeFileSync, mkdirSync, existsSync } from 'fs';
const now = new Date();
const tzOffsetMs = now.getTimezoneOffset() * 60000;
const pst = new Date(now.getTime() - tzOffsetMs);
const yyyy = pst.getFullYear();
const mm = String(pst.getMonth() + 1).padStart(2, '0');
const dd = String(pst.getDate()).padStart(2, '0');
const path = `progress/${yyyy}-${mm}-${dd}.md`;

if (!existsSync('progress')) mkdirSync('progress', { recursive: true });

const template = `# ${yyyy}-${mm}-${dd}

## What I planned
- 

## What I did
- 

## Lessons / blockers
- 

## Next steps (tomorrow)
- 
`;

if (!existsSync(path)) writeFileSync(path, template);
console.log(`Created/updated ${path}`);
