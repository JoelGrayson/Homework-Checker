const { src, dest, task, series, del }=require('gulp');
const ts=require('gulp-typescript');

task('clean', ()=>(
    del('./dist/**', {force: true})
));

task('ts-build', ()=>(
    src('./src/**/*.ts')
        .pipe(ts())
        .pipe(dest('./dist'))
));

task('copy-js', ()=>( 
    src('./src/**/*.js')
        .pipe(dest('./dist'))
));

task('build', series('ts-build', 'copy-js'));
