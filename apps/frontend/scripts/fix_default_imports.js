const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk(srcDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

const componentNames = [
    'ProductFilter', 'ActiveFilters', 'CatalogFilters', 'FilterDropdown', 'ProductSort', 'SearchBar', 'ProductSearch', 'ProductToolbar',
    'ProductCard', 'CatalogProductCard', 'ProductGrid',
    'ProductDetails', 'ProductDetailsModal', 'RelatedProducts', 'DownloadButton',
    'ProductReviewForm', 'ProductReviewList', 'ProductReviews',
    'ModelViewer3D', 'ProductViewer3D'
];

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const name of componentNames) {
        // Look for: import ComponentName from '@/components/catalog/something'
        // and replace it with: import { ComponentName } from '@/components/catalog/something'
        const defaultRegex = new RegExp(`import\\s+${name}\\s+from\\s+(['"\`])(.*?)(['"\`])`, 'g');
        if (defaultRegex.test(content)) {
            content = content.replace(defaultRegex, `import { ${name} } from $1$2$3`);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated default to named imports in ${filePath}`);
    }
});
