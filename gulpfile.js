"use strict";
var gulp = require('gulp'), // Подключаем Gulp
	browserSync = require('browser-sync').create(), // Для локального сервера
	sass = require('gulp-sass'), // Для преобразования SASS
	useref = require('gulp-useref'), // Для конкатенации CSS и JS
	gulpIf = require('gulp-if'), // Для проверки
	uglify = require('gulp-uglify'), // Для сжатия JS
	csso = require('gulp-csso'), // Для минимизации CSS
	prefix = require('gulp-autoprefixer'), // Для автоматического проставления префиксов
	imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	includer = require("gulp-x-includer"), // Для вставки шаблонов
	customizeBootstrap = require('gulp-customize-bootstrap'),
	del = require('del'); // Для удаления файлов и папок

gulp.task('server', function () { // Создаем task browser-sync
	browserSync.init({
		server: { // Определяем параметры сервера
			port: 3000, // Порт для сервера
			baseDir: "./app" // Базовая директория сервера
		},
		notify: false // Отключаем уведомления
	});
});

gulp.task('sass', function () {
	return gulp.src('./app/sass/**/*.sass') // Берем источник
		.pipe(sass().on('error', sass.logError)) // Преобразуем Sass в CSS
		.pipe(prefix({  // Создаем префиксы
			browsers: ['last 15 versions']
		}))
		.pipe(gulp.dest('./app/css')) // Выгружаем результат в папку app/css
		.pipe(browserSync.stream()) // Обновляем CSS на странице при изменении
});

gulp.task('img', function () {
	return gulp.src('./app/img/**/*') // Берем все изображения из app
		.pipe(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('./build/img')); // Выгружаем на продакшен
});

gulp.task('compileBootstrap', function() {
	return gulp.src('node_modules/bootstrap/scss/bootstrap.scss')
		.pipe(customizeBootstrap('app/scss/*.scss'))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./app/css'));
});

gulp.task('clean', function () {
	return del.sync('./build') // Удаляем папку dist перед сборкой
});

gulp.task('build', ['clean', 'sass', 'img'], function () { // создаем task для сборки проекта
	gulp.src('./app/*.html') // Берем источник
		.pipe(includer()) // выполняем include html файлов
		.pipe(useref()) // конкатенируем скрипты и стили
		.pipe(gulpIf('*.js', uglify())) // сжимаем js
		.pipe(gulpIf('*.css', csso())) // минифицируем стили
		.pipe(gulp.dest('./build')); // выгружаем скрипты и js в папку build
	gulp.src('./app/fonts/**/*') // Берем источник
		.pipe(gulp.dest('./build/fonts')); // Выгружаем шрифты в папку build
});


gulp.task('watch', function () { // создаем task для отслеживания изменений в sass
	gulp.watch('./app/sass/**/*.sass', ['sass']); // Наблюдение за SASS файлами в папке sass
	gulp.watch('./app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('./app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('default', ['watch', 'server']);
