var gulp           = require('gulp'),
    rimraf         = require('rimraf'),
    sass           = require('gulp-sass'),
    browserSync    = require('browser-sync'),
    concat         = require('gulp-concat'),
    uglify         = require('gulp-uglify'),
    svgSprite 	   = require('gulp-svg-sprite'),
    svgmin         = require('gulp-svgmin'),
    cheerio        = require('gulp-cheerio'),
    replace        = require('gulp-replace'),
    rename         = require('gulp-rename'),
    imagemin       = require('gulp-imagemin'),
    pngquant       = require('imagemin-pngquant'),
    autoprefixer   = require('gulp-autoprefixer'),
    bourbon        = require('node-bourbon'),
    notify         = require('gulp-notify'),
    plumber		   = require('gulp-plumber'),
    panini         = require('panini'),
    cssfont64      = require('gulp-cssfont64'),
    dirSync        = require('gulp-directory-sync'),
    csscomb        = require('gulp-csscomb'),
    csso           = require('gulp-csso'),
    htmlreplace    = require('gulp-html-replace');



var assetsDir = 'app/',
    outputDir = 'static/',
    buildDir  = 'build/';


// Панини
gulp.task('paniniCompare', () => {
    return gulp.src('app/pages/**/*.{html,hbs,handlebars}')
        .pipe(panini({
            root: 'app/pages/',
            layouts: 'app/layouts/',
            partials: 'app/partials/',
            data: 'app/data/',
            helpers: 'app/helpers/'
        }))
        .pipe(gulp.dest(outputDir))
        .pipe(browserSync.reload({stream: true}));
});

// Обновления статуса панини
gulp.task('paniniReset', () => {
    panini.refresh();
});

// авторелоадер браузера
gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: 'static'
        },
        notify: false
    });
});

//Svg sprite
gulp.task('svgSprite', () => {
    return gulp.src('app/img/sprite/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        // remove all fill, style and stroke declarations in out shapes
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        // cheerio plugin create unnecessary string '&gt;', so replace it.
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../img/sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest(outputDir))
});

// Sass
gulp.task('sassSync', () => {
    return gulp.src('app/sass/**/*.scss')
        .pipe(sass({
            includePaths: bourbon.includePaths
        }).on("error", notify.onError()))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(gulp.dest('static/css'))
        .pipe(browserSync.reload({stream: true}))
});

// Конкатенация js
gulp.task('libsSync', () => {
    return gulp.src([
        assetsDir + 'libs/jquery.min.js',
        assetsDir + 'libs/**/!(jquery.min.js)*.js'
    ])
        .pipe(concat('libs.js'))
        .pipe(uglify())
        .pipe(rename('libs.min.js'))
        .pipe(gulp.dest('static/js'))
        .pipe(browserSync.reload({stream: true}))
});

// Выгрузка js
gulp.task('jsSync', () => {
    return gulp.src(assetsDir + 'js/*.js')
        .pipe(plumber())
        .pipe(gulp.dest(outputDir + 'js/'))
        .pipe(browserSync.stream({once: true}));
});

//Выгрузка изображений
gulp.task('imageSync', () => {
    return gulp.src('')
        .pipe(plumber())
        .pipe(dirSync(assetsDir + 'img/static/', outputDir + 'img/', {printSummary: true, ignore: 'sprite.svg'}))
        .pipe(browserSync.stream({once: true}));
});

//Генерация шрифтов
gulp.task('fontsConvert', () => {
    return gulp.src(assetsDir + 'fonts/*.{woff,woff2}')
        .pipe(cssfont64())
        .pipe(gulp.dest(outputDir + 'fonts/'))
        .pipe(browserSync.stream({once: true}));
});


gulp.task('watch', ['sassSync', 'libsSync', 'jsSync',  'browser-sync', 'svgSprite', 'fontsConvert'], () =>  {
    gulp.watch(assetsDir + 'sass/**/*.scss', ['sassSync']);
    gulp.watch(assetsDir + 'js/**/*.js', ['jsSync']);
    gulp.watch(assetsDir + 'img/static/**/*.{jpg,png}', ['imageSync']);
    gulp.watch(assetsDir + 'img/sprite/**/*', ['svgSprite'], browserSync.reload);
    gulp.watch(assetsDir + 'fonts/*.{woff,woff2}', ['fontsConvert']);
    gulp.watch(assetsDir + '{layouts,pages,partials}/**/*.html', ['paniniReset', 'paniniCompare']);
});

gulp.task('default', ['watch'], function () {});





//-----------------------------------------Сборка

//Очистка папки build
gulp.task('cleanBuildDir', (cb) =>  {
    rimraf(buildDir, cb);
});

//Запуск Build
gulp.task('build', ['cleanBuildDir'], () => {
    gulp.start('buildImages', 'buildFonts', 'buildHtml', 'buildJs', 'buildCSS');
});

//Сжатие и выгрузка изображений
gulp.task('buildImages', () => {
    return gulp.src(outputDir + 'img/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(buildDir + 'img/'))
});

//Выгрузка шрифтов
gulp.task('buildFonts', () => {
    return gulp.src(outputDir + 'fonts/**/*')
        .pipe(gulp.dest(buildDir + 'fonts/'))
});

//Выгрузка HTML
gulp.task('buildHtml', () => {
    return gulp.src(outputDir + '**/*.html')
        .pipe(htmlreplace({
            'js': 'js/product.min.js',
            'css': 'css/main.min.css',
            cssInline: {
                src: gulp.src(assetsDir + 'sass/header.scss').pipe(sass()).pipe(csscomb()).pipe(csso({restructure: false, sourceMap: true, debug: true})),
                tpl: '<style>%s</style>'
            }
        }))
        .pipe(gulp.dest(buildDir))
});

//Выгрузска JS
gulp.task('buildJs', () => {
    return gulp.src(outputDir + 'js/**/*')
        .pipe(uglify())
        .pipe(gulp.dest(buildDir + 'js/'))
});

//Выгрузка CSS
gulp.task('buildCSS', () => {
    return gulp.src(outputDir + 'css/main.css')
        .pipe(csscomb())
        .pipe(csso({
            restructure: false,
            sourceMap: true,
            debug: true
        }))
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest(buildDir + 'css/'))
});