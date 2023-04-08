const { src, dest, task, series }=require('gulp');
const minifyJs=require('gulp-minify');
//! `gulp prod` & `gulp dev` (tasks to run) are at bottom of file


//* Clean dist folder
const del=require('del');
task('clean', ()=>
    del(['./dist/**', '!./dist'], {force: true})
);


//* .ts -> .js for background.js
const ts=require('gulp-typescript');
task('ts-build-background-dev', ()=> //just .ts -> .js
    src('./src/background.ts')
        .pipe(ts({
            target: 'es2017' //es8
        }))
        .pipe(dest('./dist'))
);
task('ts-build-background-prod', ()=> //.ts -> .js & minify
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
);


//* .ts -> .js  for content scripts
function runCmd(script) { //returns anonymous function that returns a promise running command
    return ()=>( //webpack: non-background .ts -> minified bundle.js
        new Promise((resolve, reject)=>{
            const exec=require('child_process').exec;
            exec(script, (e, stdout, stderr)=>{
                if (stderr)
                    console.log('<hw>', stderr);
                if (e)
                    console.log('<hw>', e);

                resolve(stdout);
            });
        })
    );
}
task('ts-build-dev', runCmd('npm run bundle-dev'));
task('ts-build-prod', runCmd('npm run bundle'));
task('ts-build-dev-watch', runCmd('npm run bundle-dev-watch'));


//* just in case there is a .js file in src (none)
task('copy-js-dev', ()=> // just copy
    src('./src/**/*.js')
        .pipe(dest('./dist'))
);
task('copy-js-prod', ()=> // copy & compress files
    src('./src/**/*.js')
        .pipe(minifyJs({
            ext: {
                min: '.js' // Set the file extension for minified files to just .js
            },
            noSource: true // Don’t output a copy of the source file    
        }))
        .pipe(dest('./dist'))
);


//* .sass -> .css (uglify if prod)
const dartSass=require('sass');
const sass=require('gulp-sass')(dartSass);
task('sass-build-dev', ()=> //sass -> css
    src('./src/**/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('./dist/'))
);
const uglifycss=require('gulp-uglifycss');
task('sass-build-prod', ()=> //sass -> css & compress css
    src('./src/**/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(uglifycss({
            "maxLineLen": 80,
            "uglyComments": true
        }))
        .pipe(dest('./dist/'))
);

// Add note of mode
const fs=require('fs');
task('note-dev',  ()=>
    new Promise((resolve, reject)=>{
        fs.writeFile('./dist/In Development.note', '', err=>{
            if (err)
                reject(err);
            else
                resolve(err);
        });
    })
);
task('note-prod', ()=>
    new Promise((resolve, reject)=>{
        fs.writeFile('./dist/In Production.note', '', err=>{
            if (err)
                reject(err);
            else
                resolve(err);
        });
    })
);


// Tasks to run
const prodTasks    =['clean', 'note-prod', 'ts-build-background-prod', 'ts-build-prod', 'copy-js-prod', 'sass-build-prod'];
const devTasks     =['clean', 'note-dev', 'ts-build-background-dev', 'ts-build-dev', 'copy-js-dev', 'sass-build-dev'];
const devWatchTasks=['clean', 'note-dev', 'ts-build-background-dev', 'copy-js-dev', 'sass-build-dev', 'ts-build-dev-watch']; //watch one last, so prev tasks can complete   
task('prod', series(...prodTasks)); //separate minified files
task('dev', series(...devTasks)); //one uncompressed file (errors at correct place in file for debugging)
task('dev-watch', series(...devWatchTasks)); //watches for changes in content files (webpack)
