const fs = require('fs');
let code1 = fs.readFileSync('frontend/src/pages/rh/AccessApprovalHub.jsx', 'utf8');
code1 = code1.replace(/192\.168\.0\.144:3001\/access\/requests/g, "http://192.168.0.144:3001/api/access/requests");
fs.writeFileSync('frontend/src/pages/rh/AccessApprovalHub.jsx', code1);

let code2 = fs.readFileSync('frontend/src/components/ManagerRequestModal.jsx', 'utf8');
code2 = code2.replace(/`\$\{\s*192\.168\.0\.144:\s*3001\s*\}\/access\/cost - centers`/, "'http://192.168.0.144:3001/api/access/cost-centers'");
code2 = code2.replace(/`\$\{\s*192\.168\.0\.144:\s*3001\s*\}\s*\/access\/request`/, "'http://192.168.0.144:3001/api/access/request'");
code2 = code2.replace(/`Bearer \$\{\s*token\s*\s*\}\s*`/g, "`Bearer ${token}`");
fs.writeFileSync('frontend/src/components/ManagerRequestModal.jsx', code2);
