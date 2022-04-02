const { src, dest, task, series }=require('gulp');

const del=require('del');
task('clean', ()=>(
    del(['./dist/**', '!./dist'], {force: true})
));

// .ts -> .js
task('ts-build', ()=>{
    return new Promise((resolve, reject)=>{
        const exec=require('child_process').exec;
        exec('npm run bundle', (e, stdout, stderr)=>{
            if (stderr)
                console.log(stderr);
            if (e)
                console.log(e);

            resolve(stdout);
        });
    })
});
// * OLD gulp-typescript build:
// const ts=require('gulp-typescript');
// task('ts-build', ()=>(
//     src('./src/**/*.ts')
//         .pipe(ts({
//             target: 'es2017' //es8
//         }))
//         .pipe(dest('./dist'))
// ));


task('copy-js', ()=>(  //just in case there is a .js file in src (none)
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
