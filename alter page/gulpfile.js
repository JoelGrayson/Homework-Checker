const { src, dest, task, series }=require('gulp');

const del=require('del');
task('clean', ()=>(
    del(['./dist/**', '!./dist'], {force: true})
));

// .ts -> .js
const ts=require('gulp-typescript');
task('ts-build', ()=>(
    src('./src/**/*.ts')
        .pipe(ts())
        .pipe(dest('./dist'))
));

task('copy-js', ()=>( 
    src('./src/**/*.js')
        .pipe(dest('./dist'))
));

// .sass -> .css
const dartSass=require('sass');
const sass=require('gulp-sass')(dartSass);
task('sass-build', ()=>(
    src('./src/**/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('./dist/'))
));


task('build', series('clean', 'ts-build', 'copy-js', 'sass-build'));
