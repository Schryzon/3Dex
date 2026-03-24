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

const mappings = {
    '/catalog/ProductFilter': '/catalog/filters',
    '/catalog/ActiveFilters': '/catalog/filters',
    '/catalog/CatalogFilters': '/catalog/filters',
    '/catalog/FilterDropdown': '/catalog/filters',
    '/catalog/ProductSort': '/catalog/filters',
    '/catalog/SearchBar': '/catalog/filters',
    '/catalog/ProductSearch': '/catalog/filters',
    '/catalog/ProductToolbar': '/catalog/filters',

    '/catalog/ProductCard': '/catalog/product-card',
    '/catalog/CatalogProductCard': '/catalog/product-card',
    '/catalog/ProductGrid': '/catalog/product-card',

    '/catalog/ProductDetails': '/catalog/product-details',
    '/catalog/ProductDetailsModal': '/catalog/product-details',
    '/catalog/RelatedProducts': '/catalog/product-details',
    '/catalog/DownloadButton': '/catalog/product-details',

    '/catalog/ProductReviewForm': '/catalog/reviews',
    '/catalog/ProductReviewList': '/catalog/reviews',
    '/catalog/ProductReviews': '/catalog/reviews',

    '/catalog/ModelViewer3D': '/catalog/viewer',
    '/catalog/ProductViewer3D': '/catalog/viewer'
};

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const [oldPath, newPath] of Object.entries(mappings)) {
        // We want to replace paths that end with oldPath or have oldPath as their exact string
        // e.g., '@/components/catalog/ProductFilter' 
        // or '../catalog/ProductFilter'

        // Pattern: any quote, followed by something, ending with the oldPath, followed by quote
        const regex = new RegExp(`(['"\`])((?:@|\\.\\.|\\.)[^'"\`]*)${oldPath}(['"\`])`, 'g');
        if (regex.test(content)) {
            content = content.replace(regex, `$1$2${newPath}$3`);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated imports in ${filePath}`);
    }
});
