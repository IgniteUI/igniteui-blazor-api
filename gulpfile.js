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
    del.sync("obj/**/*");
    del.sync("obj");
    del.sync("src/obj/**/*");
    del.sync("src/obj");
    callback();
    return;
// });
}

// gulp.task('clean', gulp.series('cleanSite', 'cleanMetadata', 'cleanObj'));

exports.clean = clean = gulp.series(cleanSite, cleanMetadata, cleanObj);

function copyIndex(callback) {
    console.log("copying ./doc/index.md to ./api/index.md");
    gulp.src(['./doc/index.md'])
    .pipe(gulp.dest('./api'))
    .on("end", function() {
        callback();
        return;
    });
}

function copyAssemblies(callback) {
    console.log("copying ./app/**/IgniteUI.Blazor*.dll to ./src/IgniteUI.Blazor*.dll");
    gulp.src(['./blazor-app/bin/Debug/net6.0/IgniteUI.Blazor*.*'])
    .pipe(gulp.dest('./src'))
    .on("end", function() {
        callback();
        return;
    });
}
exports.copyAssemblies = copyAssemblies;

function buildFrom(docfxJSON, callback) {
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

exports.run = gulp.series(copyIndex, buildDOC);
exports.build = gulp.series(clean, copyIndex, copyAssemblies, buildAPI);

// gulp.task('default', gulp.series('run'));
