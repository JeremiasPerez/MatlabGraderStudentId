import gulp from 'gulp'
import cleanCss from 'gulp-clean-css'
import sassCompiler from 'gulp-sass'
import zip from 'gulp-zip'
import { deleteSync } from 'del'
import webpack from 'webpack'
import webpackStream from 'webpack-stream'
import named from 'vinyl-named'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sass = sassCompiler(require('sass'))
const argv = yargs(hideBin(process.argv)).options({
  production: { type: 'boolean', default: false },
  vendor: { type: 'string', default: 'chrome', choices: ['chrome', 'firefox', 'opera', 'edge'] }
}).parse()
const destination = `dist/${argv.vendor}`

function clean () {
  deleteSync([destination, 'packages'])
  return Promise.resolve()
}
function manifest () { return gulp.src('app/manifest.json').pipe(gulp.dest(destination)) }
function scripts () {
  return gulp.src('app/scripts/*.js').pipe(named()).pipe(webpackStream({
    mode: argv.production ? 'production' : 'development',
    devtool: argv.production ? false : 'inline-source-map',
    module: { rules: [{ test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' }] }
  }, webpack)).pipe(gulp.dest(`${destination}/scripts`))
}
function styles () {
  return gulp.src('app/styles/*.scss').pipe(sass({ outputStyle: argv.production ? 'compressed' : 'expanded' }).on('error', sass.logError)).pipe(cleanCss()).pipe(gulp.dest(`${destination}/styles`))
}
function staticFiles () {
  return gulp.src(['app/_locales/**/*', 'app/images/**/*', 'app/fonts/**/*', 'app/pages/**/*'], { base: 'app' }).pipe(gulp.dest(destination))
}
const build = gulp.series(clean, gulp.parallel(manifest, scripts, styles, staticFiles))
function pack () {
  const extension = argv.vendor === 'firefox' ? 'xpi' : 'zip'
  return gulp.src(`${destination}/**/*`).pipe(zip(`matlab-grader-student-id-${argv.vendor}.${extension}`)).pipe(gulp.dest('packages'))
}
function watch () {
  gulp.watch('app/manifest.json', manifest)
  gulp.watch('app/scripts/**/*.js', scripts)
  gulp.watch('app/styles/**/*.scss', styles)
  gulp.watch(['app/_locales/**/*', 'app/images/**/*', 'app/fonts/**/*', 'app/pages/**/*'], staticFiles)
}
gulp.task('build', build)
gulp.task('pack', gulp.series(build, pack))
gulp.task('watch', gulp.series(build, watch))
