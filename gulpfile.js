var gulp = require('gulp'),
  p = require('gulp-load-plugins')(),
  lr = require('tiny-lr'),
  server = lr();

var config = {
  src: '_src/',
  dest: 'assets/',
  bourbon: true,
  neat: false
};

var source = {
  styles: config.src + 'styles',
  scripts: config.src + 'scripts',
  images: config.src + 'images',
  svg: config.src + 'svg',
  sprites: config.src + 'sprites'
};

var dest = {
  css: config.dest + 'css',
  js: config.dest + 'js',
  images: config.dest + 'images',
  fonts: config.dest + 'fonts'
};

gulp.task('mkdirs', function(){
  var dirs = gulp.src('.')
    .pipe(p.exec('mkdir ' + config.src + '; cd ' + config.src))
    .pipe(p.exec('mkdir ' + source.styles + ' ' + source.scripts + ' ' + source.images + ' ' + source.svg + ' ' + source.sprites))
    .pipe(p.notify({ message: 'Source directories created' }));
  return dirs;
});

gulp.task('bourbon', ['mkdirs'], function(){
  var bourbon = gulp.src('.')
    .pipe(p.if(config.bourbon, p.exec('cd ' + source.styles + '; bourbon install')))
    .pipe(p.notify({ message: 'Bourbon installed' }));
  return bourbon;
});

gulp.task('neat', ['bourbon'], function(){
  var neat = gulp.src('.')
    .pipe(p.if(config.neat, p.exec('cd ' + source.styles + '; neat install')))
    .pipe(p.notify({ message: 'Neat installed' }));
  return neat;
});

gulp.task('init', ['mkdirs', 'bourbon', 'neat']);

gulp.task('styles', function(){
  return gulp.src([source.styles + '/**/*.scss', '!' + source.styles + '/**/_*.scss'])
    .pipe(p.sass())
    .pipe(p.concat('site.css'))
    .pipe(p.autoprefixer('last 2 versions'))
    .pipe(p.minifyCss())
    .pipe(gulp.dest(dest.css))
    .pipe(p.livereload(server))
    .pipe(p.notify({ message: 'Styles task completed' }));
});

gulp.task('scripts', function(){
  return gulp.src([source.scripts + '/**', '!' + source.scripts + '/vendor/**'])
    .pipe(p.concat('all.js'))
    .pipe(p.uglify())
    .pipe(gulp.dest(dest.js))
    .pipe(p.livereload(server))
    .pipe(p.notify({ message: 'Scripts task completed' }));
});

gulp.task('images', function(){
  return gulp.src([source.images + '/**'])
    .pipe(p.newer(dest.images))
    .pipe(p.imagemin({ optimizationLevel: 3 }))
    .pipe(gulp.dest(dest.images))
    .pipe(p.livereload(server))
    .pipe(p.notify({ message: 'Images task completed' }));
});

gulp.task('sprites', function(){
  return gulp.src([source.sprites + '/**'])
    .pipe(p.sprite('sprite.png', {
      imagePath: '../images',
      cssPath: source.styles,
      preprocessor: 'scss',
      prefix: '_'
    }))
    .pipe(gulp.dest(dest.images))
    .pipe(p.livereload(server))
    .pipe(p.notify({ message: 'Sprite generation completed' }));
});

gulp.task('iconfont', function(){
  gulp.src([source.svg + '/**'])
    .pipe(p.iconfont({
      fontName: 'svgicons',
      appendCodepoints: true
     }))
    .pipe(gulp.dest(dest.fonts))
    .pipe(p.notify({ message: 'SVG icon font generation completed' }));
});

gulp.task('build', ['styles', 'scripts', 'images', 'sprites', 'iconfont']);

gulp.task('watch', function(){
  server.listen(35729, function(err){

    if(err){
      return console.log(err);
    }

    gulp.watch(source.styles + '/**/*', ['styles']);
    gulp.watch(source.scripts + '/**/*', ['scripts']);
    gulp.watch(source.images + '/**/*', ['images']);
    gulp.watch(source.svg + '/**/*', ['iconfont']);
    gulp.watch(source.sprites + '/**/*', ['sprites']);

  });
});

gulp.task('default', ['watch']);
