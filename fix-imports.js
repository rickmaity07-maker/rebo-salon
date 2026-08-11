const fs = require('fs');
const files = ['src/app/api/email/route.ts', 'src/app/api/sms/route.ts', 'src/app/api/translate/route.ts', 'src/app/api/translate-ui/route.ts'];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from '\.\.\/\.\.\/\.\.\/lib\/firebase-admin'/g, "from '@/lib/firebaseAdmin'");
  content = content.replace(/from '\.\.\/\.\.\/\.\.\/lib\/validation'/g, "from '@/lib/validation'");
  fs.writeFileSync(file, content);
  console.log('Fixed imports in', file);
});