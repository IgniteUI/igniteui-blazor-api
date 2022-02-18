var gulp = require('gulp');
var del = require('del');
var { spawnSync } = require('child_process');

// gulp.task('cleanSite', function(callback) {
function cleanSite(callback) {
    del.sync("_site/**/*.*");
    del.sync("_site");
    callback();
    return;
    // });
}
// gulp.task('cleanMetadata', function(callback) {
function cleanMetadata(callback) {
    del.sync([
        "api/**/*.yml",
       "!api/toc.yml"]);
    callback();
    return;
    // });
}

// gulp.task('cleanObj', function(callback) {
function cleanObj(callback) {
    del.sync("**/obj/**/*");
    del.sync("**/obj");
    callback();
    return;
// });
}

// gulp.task('clean', gulp.series('cleanSite', 'cleanMetadata', 'cleanObj'));

exports.clean = clean = gulp.series(cleanSite, cleanMetadata, cleanObj);

function copy(callback) {
    console.log("copying ./doc/index.md to ./api/index.md");
    // return gulp.src(['./doc/index.md'] , { base: '.' }).pipe(gulp.dest('./api'));
    gulp.src(['./doc/index.md'])
    .pipe(gulp.dest('./api'))
    .on("end", function() {
        callback();
        return;
    });
}

function buildFrom(docfxJSON, callback) {
    // copy();
    console.log("build " + docfxJSON);
    var response = spawnSync("docfx", [docfxJSON], { stdio: 'inherit' });
    if (response.status != 0)
    {
        console.log('Exiting docfx with Error code: ' + response.status);
    }
    else {
        console.log("docfx complete");
    }

    callback();
    return;
}

// gulp.task('buildAPI', gulp.series('clean', function(callback) {
//     buildFrom("docfx-build.json", callback);
// }));

// gulp.task('buildDOC', gulp.series(function(callback) {
//     buildFrom("docfx-run.json", callback);
// }));

function buildAPI(callback) {
    buildFrom("docfx-build.json", callback);
}
exports.buildAPI = buildAPI;

function buildDOC(callback) {
    buildFrom("docfx-run.json", callback);
}
exports.buildDOC = buildDOC;

exports.run = gulp.series(copy, buildDOC);
exports.build = gulp.series(clean, copy, buildAPI);

// gulp.task('default', gulp.series('run'));
