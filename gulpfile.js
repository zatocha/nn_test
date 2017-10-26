"use strict";
var gulp = require('gulp'),
	browserSync = require('browser-sync').create(), // подключаем Browser Sync
	sass = require('gulp-sass'), // подключаем sass пакет
	useref = require('gulp-useref'), // подключаем библиотеку для конкатенации стилей и скрипто
	gulpIf = require('gulp-if'), //
	uglify = require('gulp-uglify'), // подключаем библиотеку для сжатия JS
	csso = require('gulp-csso'), // подключаем библиотеку для минимизации стилей
	prefix = require('gulp-autoprefixer'), // подключаем библиотеку для автоматического добавления префиксов
	includer = require("gulp-x-includer"), // подключаем библиотеку для вставки html шаблонов
	del = require('del'); // подключаем библиотеку для удаления файлов и папок

gulp.task('server', function () { // создаем task browser-sync
	browserSync.init({
		server: {
			port: 3000,
			baseDir: "./app"
		},
		notify: false // отключаем уведомления
	});
});

gulp.task('styles', function () { // создаем task
	gulp.src('./app/sass/**/*.sass')
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix({
			browsers: ['last 15 versions']
		}))
		.pipe(gulp.dest('./app/css'))
		.pipe(browserSync.stream());
});

gulp.task('clean', function () {
	return del.sync('./build'); // Удаляем папку dist перед сборкой
});

gulp.task('build', ['clean'], function () { // создаем task для сборки проекта
	gulp.src('./app/*.html')
		.pipe(includer()) // выполняем include html файлов
		.pipe(useref()) // конкатенируем скрипты и стили
		.pipe(gulpIf('*.js', uglify())) // сжимаем js
		.pipe(gulpIf('*.css', csso())) // минифицируем стили
		.pipe(gulp.dest('./build')); // выгружаем скрипты и js в папку build
	gulp.src('./app/fonts/**/*') // берем источник
		.pipe(gulp.dest('./build/fonts')); // выгружаем шрифты в папку build
	gulp.src('./app/img/**/*') // берем источник
		.pipe(gulp.dest('./build/img')); // выгружаем картинки в папку build
});


gulp.task('watch', function () { // создаем task для отслеживания изменений в sass
	gulp.watch('./app/sass/**/*.sass', ['styles']);
});

gulp.task('default', ['watch', 'server']);
