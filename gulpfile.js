var gulp = require('gulp'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  notify = require('gulp-notify'),
  babel  = require('gulp-babel'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer')

gulp.task( 'default', function() {
  
  var b = browserify({
    entries:'./js/loader.js'
  })

  // bundles files and
  // converts results to stream object  
  b.bundle()
    // converts to vinyl stream
    .pipe( source( 'app.js' ) )
    // buffer entire vinyl object
    .pipe( buffer() )
    .pipe( babel({ presets:['es2015'] }) )
    .pipe( uglify() )
    .pipe( gulp.dest('./dist') )
    .pipe( notify({
      message: 'build complete.',
      onLast:true
    }) )
})

gulp.task( 'watch', function() {
  gulp.watch( './js/**.js', function() {
    gulp.run('default')
  })
})