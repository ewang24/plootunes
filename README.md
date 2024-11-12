# About

Plootunes is my personal music library management and music player project.  
It started last year as a way for me to learn some new technologies outside of work, but my goal is to create a full fledged solution that others can use.  
Plootunes' goal is to be your one stop music library management solution for your collection of audio files. If you are old fashioned and still prefer to collect physical media and then rip them to your PC, or if you regularly purchase music on Bandcamp, or Amazon Music   or other similar platforms, Plootunes aims to make your music listening experience easier and richer.
It (will) feature(s) a desktop app with an integrated music player, rich playlist and queue capabilities and a lots of statistical tracking for users who like to see numbers.   
In addition, the desktop app provides powerful editing capabilities to manage your music library, including bulk editing of metadata.  
Plootunes also has a companion mobile app with the same robust functionality as the desktop app. Of course, it sounds like a hassle to have to manage two versions of your music library, right? Well, Plootunes has you covered. It features a powerful ability to sync your  
 music library between device, so you don't have to worry about updating metadata on one device and forgetting to on another. This feature allows you to seamlessly manage your library accross multiple physical devices, while tracking stats from all of them at the same time.  
You won't have to worry about the hassles of managing your local library of music again!  
  
Of course, a lot of this is still in progress but I have every intention of achieving all of the above. I also plan to use this project for my personal music listening every single day.   
  
Currently, I have the desktop app working with a functional audio player, and have started on the mobile app.  

### My road map of features in relative priority, at a high level, is below:  
  
- Mobile app is fully functional as a player to play library on a device  
- Library syncing between mobile and desktop app works seamlessly  
- Bulk (and single file) editing of metadata works on desktop application  
- Both versions of the app provide rich stat tracking for nerds who want to see how many times they listened to song X last year on the third Tuesday of May  
- Year in review at the end of every year (I know, every app is doing this now, but I like them OK)  
  
#  Technical Details
  
Plootunes is a TypeScript project.  
The desktop app is written an Electron app with a React render view.  
The mobile app is a React Native app.  
It is a monorepo project that shares core functionality between the two versions of the app. Mainly, both versions of the app reference a common database layer. Both versions of the app use an sqlite database to track library information and index audio files for quick  
loading. I have setup shared schemas and queries between the two versions of the app, so that the core business logic will largely be identical (accounting for differences in UI of course).  
My goal is to have high unit test coverage on both versions of the app, as well as lots of integration tests. I want it to be as solid as possible, after all, I'm planning on using this every day myself.    
My plan for the library syncing, currently, is to only allow syncing over a local network. So both devices would have to be on the same network and they would just open a socket.   

### Technical goals:    
- Implement CI/CD on Github
- High unit test coverage with robust integration tests of both the back end and front end functionality
- High reusability between the two parts of the monorepo
- Best Practices, SOLID, all that good stuff
- Make cool things and have fun

# Documentation

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
      
