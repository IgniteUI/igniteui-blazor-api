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

exports.run = gulp.series(updateIndex, copyIndex, buildDOC);
exports.build = gulp.series(clean, updateIndex, copyIndex, copyBlazorSource, buildAPI);

// gulp.task('default', gulp.series('run'));

function updateIndex(callback) {

    let jsonFile = fs.readFileSync("index-links.json", "utf8");
    let jsonLinks = JSON.parse(jsonFile);
    // console.log(jsonLinks);

    var tableMarkdown = "";
    tableMarkdown += "API Component        | Resources \n"
    tableMarkdown += "-------------------- | ------------------- \n"

    for (const info of jsonLinks) {
        // [IgbTreemap](IgniteUI.Blazor.Controls.IgbTreemap.html) | [Docs & Examples](https://www.infragistics.com/products/ignite-ui-blazor/blazor/components/charts/types/treemap-chart)
        var api = info.api;
        if (api.indexOf(".") < 0) {
            api = "IgniteUI.Blazor.Controls." + api;
        }
        api += ".html";

        var row = "";
        row += "[" + info.api + "]" + "(" + api + ") | ";

        var mdLinks = [];
        for (const link of info.links) {
            var mdLink = "[" + (link.text === undefined ? "Docs & Examples" : link.text) + "]";
            mdLink += "(https://www.infragistics.com/products/ignite-ui-blazor/blazor/components" + link.url + ")";
            mdLinks.push(mdLink);
        }
        row += mdLinks.join(" <br> ");

        tableMarkdown += row + "\n";
    }
    // console.log(tableMarkdown);

    var indexFiles =  ["./index.md", "./doc/index.md"];
    for (const filePath of indexFiles) {
        let indexFile = fs.readFileSync(filePath, "utf8");
        var tableStart = indexFile.indexOf("<!-- auto-gen-table-start -->") + 29;
        var tableEnd = indexFile.indexOf("<!-- auto-gen-table-end -->");

        var output = indexFile.substring(0, tableStart) + "\n" + tableMarkdown + indexFile.substring(tableEnd);;

        // console.log(output);
        fs.writeFileSync(filePath, output);
    }



    if (callback)
        callback();
}
exports.updateIndex = updateIndex;