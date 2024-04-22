const gulp = require('gulp'); // Import gulp module
const sourcemaps = require('gulp-sourcemaps');
gulp.task('build', () => {
    var ts = require('gulp-typescript');
    var project = ts.createProject('./tsconfig.json');
    var tsResult = project.src()
        .pipe(sourcemaps.init())
        .pipe(project());
    
    return tsResult.js
        .pipe(sourcemaps.write('.', {
            sourceRoot: './'
        }))
        .pipe(gulp.dest('./dist'));
    });