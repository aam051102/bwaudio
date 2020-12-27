const gulp = require("gulp");
const minify = require("gulp-minify");
const babel = require("gulp-babel");

function js(next) {
    gulp.src("./src/*.js")
        .pipe(
            babel({
                presets: ["@babel/env"],
            }).on("error", (err) => console.error(err))
        )
        .pipe(
            minify({
                ext: {
                    min: ".js",
                },
                noSource: true,
            }).on("error", (err) => console.error(err))
        )
        .pipe(gulp.dest("./dist/"));

    next();
}

gulp.task("build", function (next) {
    js(next);

    next();
});
