const fs = require('fs');
const readline = require('readline/promises');
const path = require('path');

async function generateHandlerFileImports() {
    const handlersDirectory = path.resolve(__dirname, '../src/electron/dist/electron/services/handlers/handlerServices');
    const outputFile = path.resolve(__dirname, '../src/electron/dist/electron/services/handlers/decorators/generatedHandlerImports.js');

    const imports = [];

    const readDirectory = async (dir)=> {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await readDirectory(fullPath);
            }
            //This is going to be operating out of the dist folder when it runs, so the extensions will be .js
            else if (entry.isFile() && entry.name.endsWith('.js')) {
                
                const relative = ('../handlerServices/' + path.join(path.relative(handlersDirectory, entry.parentPath), entry.name)).replace(/\\/g, '/');
                console.log("relative", relative);
                imports.push(`var ${entry.name.replaceAll(".", "_")}_dynamic_import = require('${relative}');`);
            }
        }
    };

    await readDirectory(handlersDirectory);
    fs.writeFileSync(outputFile, imports.join('\n') + '\n');
}

generateHandlerFileImports();