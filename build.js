const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy static files
const staticFiles = ['manifest.json', 'options.html'];
staticFiles.forEach(file => {
    fs.copyFileSync(path.join('src', file), path.join('dist', file));
});

// Build TypeScript files
const entryPoints = ['background.ts', 'content.ts', 'options.ts'];

entryPoints.forEach(entry => {
    esbuild.buildSync({
        entryPoints: [path.join('src', entry)],
        bundle: true,
        outfile: path.join('dist', entry.replace('.ts', '.js')),
        platform: 'browser',
        target: 'es2017',
        format: 'esm',
        minify: false,
        sourcemap: false,
    });
});

console.log('Build completed successfully!'); 