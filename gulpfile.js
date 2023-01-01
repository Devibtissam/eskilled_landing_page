const { series, src, dest, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
// const babel = require('gulp-babel');
// const terser = require('gulp-terser');
let imagemin;
const imagewebp = require('gulp-webp');
const browserSync = require('browser-sync').create();

// css Task
function scssTask() {
  return src('scss/main.scss', { sourcemaps: true })
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(postcss([cssnano()]))
    .pipe(dest('dist', { sourcemaps: '.' }));
}

// Js Task
// function jsTask() {
//   return src('app/js/*.js', { sourcemaps: true })
//     // .pipe(babel({ presets: ['@babel/preset-env'] }))
//     .pipe(terser())
//     .pipe(dest('dist', { sourcemaps: '.' }));
// }

//optimize and move images
// function optimizeimg() {
//   return src('images/*.{jpg,png}') // change to your source directory
//     .pipe(imagemin([
//       imagemin.mozjpeg({ quality: 80, progressive: true }),
//       imagemin.optipng({ optimizationLevel: 2 }),
//     ]))
//     .pipe(dest('dist/images')) // change to your final/public directory
// };

const optimizeimg = series(
    async () => {
        imagemin = await import('gulp-imagemin');
    },
    () => src('./images/**/*')
        .pipe(
            imagemin.default(
                [
                    imagemin.mozjpeg({ quality: 80, progressive: true }),
                    imagemin.optipng({ optimizationLevel: 2})
                ]))
        .pipe(dest('./dist/images'))
);

//optimize and move images
function webpImage() {
  return src('dist/images/*.{jpg,png}') // change to your source directory
    .pipe(imagewebp())
    .pipe(dest('dist/images')) // change to your final/public directory
};

function browserSyncServer(cb) {
  browserSync.init({
    server: {
      baseDir: './',
    },
    notify: {
      styles: {
        top: 'auto',
        bottom: '0',
      },
    },
  });
  cb();

}

function browserSyncReload(cb) {
  browserSync.reload();
  cb();
}

function watchTasks(cb) {
  watch('*.html', browserSyncReload);
  watch(
    ['scss/**/*.scss', 'images/*.{png,jpg}'],
    series(scssTask,optimizeimg,webpImage, browserSyncReload)
  );
  cb();
}
exports.default = series(scssTask, optimizeimg,webpImage,browserSyncServer, watchTasks);

exports.build = series(scssTask,optimizeimg, webpImage);