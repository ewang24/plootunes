const { execSync, exec } = require('child_process');
const fs = require('fs');
const readline = require('readline/promises');
const path = require('path');
const { stdin: input, stdout: output } = require('process');

const dbShortcut = "../plootunes.sqlite";
const lineReader = readline.createInterface({ input, output });

async function installAllDependencies() {
    execSync("npm run install:all", { stdio: 'inherit' });
    let sqliteSrc = "../deps/sqlite3"
    let sqliteDest = (await lineReader.question(
        `sqlite3 is included in this repo for convenience.
        Input the location where you would like to copy sqlite3.
        Enter nothing for default (c:\\sqlite3):`
    )) || 'c:\\sqlite3';

    fs.cpSync(sqliteSrc, sqliteDest, {
        recursive: true,
        force: true
    });
    console.log('Copied sqlite3')
}

async function copyDb() {
    console.log("This script will copy a sqlite db to the proper location for the dev mode app to read.")
    let userInputSource = await lineReader.question("Input the location of the db file to use (default is /plootunes-backup.sqlite). Enter nothing for default:");
    if (!userInputSource) {
        userInputSource = "./data/plootunes-backup.sqlite";
    }

    const appDataPath = process.env.APPDATA;
    const destPath = path.join(appDataPath, 'Electron', 'plootunes.sqlite');

    if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
    }

    console.log('Copying db...');
    fs.copyFileSync(userInputSource, destPath);
    console.log('Done copying\ncreating symlink...');

    if (fs.lstatSync(dbShortcut)) {
        fs.unlinkSync(dbShortcut);
    }

    fs.symlinkSync(destPath, dbShortcut, 'file');

    console.log('Symlink created...');
}

function createTables() {
    console.log("Creating tables...")
    execSync("npm run createTables", { stdio: 'inherit' });
    console.log("Tables created");
}


async function fullSetup() {
    await installAllDependencies();
    await copyDb();
    createTables();
}

async function start() {

    let useSelection = await lineReader.question(`
        This script will guide you through setting up the project.
        Select an option below:
        0: Full setup (this will prompt you for input several times)
        1: Install all dependencies (sqlite included)
        2: Copy DB files
        3: Create DB tables
    `);

    console.log(`Selected: ${useSelection}`);

    switch (useSelection) {
        case "0":
            await fullSetup();
            break;
        case "1":
            await installAllDependencies();
            break;
        case "2":
            await copyDb();
            break;
        case "3":
            createTables();
            break;
    }

    console.log("All done!");
    process.exit(0);
}

start();