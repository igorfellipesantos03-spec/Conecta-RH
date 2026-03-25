const { execSync } = require('child_process');
const fs = require('fs');

try {
  const status = execSync('git status', { encoding: 'utf-8' });
  const diff = execSync('git diff HEAD', { encoding: 'utf-8' });
  const data = JSON.stringify({ status, diff });
  fs.writeFileSync('git_diff_result.json', data, 'utf-8');
  console.log('Diff saved to git_diff_result.json');
} catch (error) {
  console.error('Error getting git diff:', error);
}
