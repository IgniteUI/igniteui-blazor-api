#  Ignite UI for Blazor API

This project generates API documentation for **Ignite UI for Blazor** components by:

- restoring IgniteUI.Blazor packages in the `app` folder
- installing npm packages
- building Blazor API project

## Setup Blazor Application

This section will guide you to setup a blazor application in the `app` folder:

- open **VS Code** terminal window
- run `cd app` command
- run `dotnet restore --force` command
- run `dotnet build --force` command

## Setup Blazor API

This section will guide you to setup docs project in the root for this repo:

- run `cd ..` command
- run `npm install` command

<!-- - copy `.dll` and `.xml` files from from latest [Blazor Packages](http://proget.infragistics.local:81/packages?Count=500&FeedId=13), e.g:

    - [IgniteUI.Blazor 21.2](http://proget.infragistics.local:81/feeds/IgniteUINuGet/IgniteUI.Blazor/21.2.818-dev)
    - [IgniteUI.Blazor.Documents.Excel 21.2](http://proget.infragistics.local:81/feeds/IgniteUINuGet/IgniteUI.Blazor.Documents.Excel/21.2.818-dev)
    - [IgniteUI.Blazor.Documents.Core 21.2](http://proget.infragistics.local:81/feeds/IgniteUINuGet/IgniteUI.Blazor.Documents.Core/21.2.818-dev)

- paste copied `.dll` and `.xml` files in `src` folder:

<img src="./images/src-folder.PNG" alt="src-folder" height="270" style="margin-left: 40px"/> -->

## Building Blazor API

This section builds a website for Blazor API:

- run `gulp build` to generate output files in `_site` folder
- copy content of the `_site` folder to hosting server

## Updating API Landing Page

This section explains how to update [API Landing Page](https://staging.infragistics.com/blazor/docs/api/api/index.html)

- open `index-links.json` file

- add entries for new API members, where `api` is name of API component, and `url` is routing path for a topic that provides documentation and examples of the API component

```
{ "api": "IgbTreeGrid", "links": [ { "url": "/grids/tree-grid/overview" }] },
```

- run `gulp updateIndex` to generate a table with API mapping to topics in `index.md` files

- commit your changes and create a new Pull Request