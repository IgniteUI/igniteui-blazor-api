var gulp = require('gulp');
var del = require('del');
let es = require('event-stream');
let fs = require('fs')

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

function copyBlazorSource(callback) {
    console.log("copying ./app/**/IgniteUI.Blazor*.* to ./src/IgniteUI.Blazor*.*");
    gulp.src(['./app/bin/Debug/net6.0/IgniteUI.Blazor*.*'])
    .pipe(es.map(function(file, fileCallback) {
        console.log("copying " + file.dirname + '/' + file.basename);
        fileCallback(null, file);
    }))
    .pipe(gulp.dest('./src'))
    .on("end", function() {
        callback();
        return;
    });
}
exports.copyBlazorSource = copyBlazorSource;

function verifyBlazorSource(callback) {
    let srcFiles = [
        './src/IgniteUI.Blazor.dll',
        './src/IgniteUI.Blazor.xml',
        './src/IgniteUI.Blazor.Documents.Core.dll',
        './src/IgniteUI.Blazor.Documents.Core.xml',
        './src/IgniteUI.Blazor.Documents.Excel.dll',
        './src/IgniteUI.Blazor.Documents.Excel.xml',
    ]
    var filesMissing = [];
    for (const filePath of srcFiles) {
        if (fs.existsSync(filePath)) {
            console.log("found:   " + filePath);
        } else {
            console.log("missing: " + filePath);
            filesMissing.push(filePath);
        }
    }
    if (filesMissing.length > 0) {
        throw new Error("Cannot build while these files are missing: \n" + filesMissing.join('\n') + "\n>>> Check if you build Blazor app from in the `app` folder <<<");
    }
    if (callback)
        callback();
}
exports.verifyBlazorSource = verifyBlazorSource;

function buildFrom(docfxJSON, callback) {
    console.log("build " + docfxJSON);

    verifyBlazorSource();

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
exports.build = gulp.series(clean, copyIndex, copyBlazorSource, buildAPI);

// gulp.task('default', gulp.series('run'));
