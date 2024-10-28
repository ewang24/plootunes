This is my little dumb music player app

Desktop app:
    to run:
    npm run react
    npm run electron

Mobile app:
    Run android studio and start an emulator.
    To deploy mobile app to android emulator:
        cd to mobile folder:
            npm run start
    
    To build mobile app (necessary when native code has been changed. EX: adding a new native library. Not necessary when just TS changed.):
        npm run deployDevLocal (needs WSL if on Windows. Will need to install node https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl#install-nvm-nodejs-and-npm).
        or
        npm run deployDev (build on expo's servers).
    