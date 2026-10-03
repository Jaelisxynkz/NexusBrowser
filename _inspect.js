const fs=require('fs');
const f=fs.readFileSync('src/components/nexus/NexusShell.tsx','utf8');
const i=f.indexOf('NexusVPN toolbar entry');
console.log('idx',i);
console.log(JSON.stringify(f.substring(i, i+340)));
