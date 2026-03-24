const fs = require('fs');
const path = require('path');

const dirs = ['filters', 'product-card', 'product-details', 'reviews', 'viewer'];
const basePath = path.join(__dirname, '../src/components/catalog');

dirs.forEach(dir => {
    const dirPath = path.join(basePath, dir);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.tsx'));
        const exports = files.map(file => {
            const name = path.basename(file, '.tsx');
            return `export { default as ${name} } from './${name}';\nexport * from './${name}';`;
        }).join('\n');
        fs.writeFileSync(path.join(dirPath, 'index.ts'), exports + '\n');
        console.log(`Generated index.ts for ${dir}`);
    }
});
