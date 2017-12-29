"use strict";
var gulp = require('gulp'), // Подключаем Gulp
	browserSync = require('browser-sync').create(), // Для локального сервера
	sass = require('gulp-sass'), // Для преобразования SASS
	useref = require('gulp-useref'), // Для конкатенации CSS и JS
	gulpIf = require('gulp-if'), // Для проверки
	uglify = require('gulp-uglify'), // Для сжатия JS
	csso = require('gulp-csso'), // Для минимизации CSS
	prefix = require('gulp-autoprefixer'), // Для автоматического проставления префиксов
	spritesmith = require('gulp.spritesmith'), // Для создания CSS спрайтов
	imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	includer = require("gulp-x-includer"), // Для вставки шаблонов
	del = require('del'), // Для удаления файлов и папок
	rename = require("gulp-rename"), // Для перименования файлов
	noopener = require('gulp-noopener'); // Защита внешних ссылок

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
	return gulp.src(['./app/sass/**/*.sass', './app/sass/**/*.scss']) // Берем источник
		.pipe(sass().on('error', sass.logError)) // Преобразуем Sass в CSS
		.pipe(prefix({  // Создаем префиксы
			browsers: ['last 15 versions']
		}))
		.pipe(gulp.dest('./app/css')) // Выгружаем результат в папку app/css
		.pipe(browserSync.stream()) // Обновляем CSS на странице при изменении
});

gulp.task('fileInclude', function () {
	gulp.src('./app/_*.html')
		.pipe(includer()) // выполняем include html файлов
		.pipe(rename(function (path) {
			path.basename = path.basename.replace(/^_/, '');
		}))
		.pipe(gulp.dest('./app'))
		.pipe(browserSync.stream())
});

gulp.task('sprite', function () {
	var spriteData = gulp.src('./app/img/sprite/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'sprite.css'
	}));
	spriteData.img.pipe(gulp.dest('./app/img')); // путь, куда сохраняем картинку
	spriteData.css.pipe(gulp.dest('./app/css')); // путь, куда сохраняем стили
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

gulp.task('clean', function () {
	return del.sync('./build') // Удаляем папку dist перед сборкой
});

gulp.task('build', ['clean', 'img', 'sass'], function () { // создаем task для сборки проекта
	gulp.src(['./app/_*.html', '!./app/-*.html']) // Берем источник
		.pipe(includer()) // выполняем include html файлов
		.pipe(rename(function (path) {
			path.basename = path.basename.replace(/^_/, '');
		}))
		.pipe(useref()) // конкатенируем скрипты и стили
		.pipe(gulpIf('*.js', uglify())) // сжимаем js
		.pipe(gulpIf('*.css', csso())) // минифицируем стили
		.pipe(noopener.overwrite()) // Добавляем защиту ссылок
		.pipe(gulp.dest('./build')); // выгружаем скрипты и js в папку build
	gulp.src('./app/fonts/**/*') // Берем источник
		.pipe(gulp.dest('./build/fonts')); // Выгружаем шрифты в папку build
});

gulp.task('watch', function () { // создаем task для отслеживания изменений в sass
	gulp.watch(['./app/sass/**/*.sass', './app/sass/**/*.scss'], ['sass']); // Наблюдение за SASS и SCSS файлами
	gulp.watch(['./app/-*.html', './app/_*.html'], ['fileInclude']); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('./app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('default', ['watch', 'fileInclude', 'server']);
