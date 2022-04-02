const { src, dest, task, series }=require('gulp');
const minifyJs=require('gulp-minify');
//! `gulp prod` & `gulp dev` (tasks to run) are at bottom of file


//* Clean dist folder
const del=require('del');
task('clean', ()=>(
    del(['./dist/**', '!./dist'], {force: true})
));


//* .ts -> .js for background.js
const ts=require('gulp-typescript');
task('ts-build-background-dev', ()=>( //just .ts -> .js
    src('./src/background.ts')
        .pipe(ts({
            target: 'es2017' //es8
        }))
        .pipe(dest('./dist'))
));
task('ts-build-background-prod', ()=>( //.ts -> .js & minify
    src('./src/background.ts')
        .pipe(ts({
            target: 'es2017' //es8
        }))
        .pipe(minifyJs({
            ext: {
                min: '.js' // Set the file extension for minified files to just .js
            },
            noSource: true // Don’t output a copy of the source file    
        }))
        .pipe(dest('./dist'))
));


//* .ts -> .js  for content scripts
task('ts-build-dev', ()=>( //webpack: non-background .ts -> minified bundle.js
    new Promise((resolve, reject)=>{
        const exec=require('child_process').exec;
        exec('npm run bundle', (e, stdout, stderr)=>{
            if (stderr)
                console.log(stderr);
            if (e)
                console.log(e);

            resolve(stdout);
        });
    })
));
task('ts-build-prod', ()=>( //.ts files -> each own uncompressed .js files
    src('./src/**/[!background]*.ts') //all files except background.ts
        .pipe(ts({
            target: 'es2017' //es8
        }))
        .pipe(dest('./dist'))
));


//* just in case there is a .js file in src (none)
task('copy-js-dev', ()=>( // just copy
    src('./src/**/*.js')
        .pipe(dest('./dist'))
));
task('copy-js-prod', ()=>( // copy & compress files
    src('./src/**/*.js')
        .pipe(minifyJs({
            ext: {
                min: '.js' // Set the file extension for minified files to just .js
            },
            noSource: true // Don’t output a copy of the source file    
        }))
        .pipe(dest('./dist'))
));


//* .sass -> .css (uglify if prod)
const dartSass=require('sass');
const sass=require('gulp-sass')(dartSass);
task('sass-build-dev', ()=>( //sass -> css
    src('./src/**/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('./dist/'))
));
const uglifycss=require('gulp-uglifycss');
task('sass-build-prod', ()=>( //sass -> css & compress css
    src('./src/**/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(uglifycss({
            "maxLineLen": 80,
            "uglyComments": true
        }))
        .pipe(dest('./dist/'))
));





// Tasks to run
const prodTasks=['clean', 'ts-build-background-prod', 'ts-build-prod', 'copy-js-prod', 'sass-build-prod'];
const devTasks=['clean', 'ts-build-background-dev', 'ts-build-dev', 'copy-js-dev', 'sass-build-dev'];
task('prod', series(...prodTasks)); //separate minified files
task('dev', series(...devTasks)); //one uncompressed file (errors at correct place in file for debugging)
