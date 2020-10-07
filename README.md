# snowpack-plugin-sass-compiler
This small snowpack plugin will gather all your spread out `scss` files within `src` folder, merge them, compile them into `css` and store them in a desired ouput folder. Then it's up to you how you want to use the outputted css file. But the main idea is to link to the outputted file directly in the html file.

The default output dir is within `public` folder. The reason why for that is then will snowpack itself take care adding the file to the build.

**Note: Do not manually add the output dir. Just specify the output dir in the `outputPath` field and let the plugin automatically create that dir. Also, you should add the output dir to '.gitignore' so it never gets stored in the code tree.**

## Whats in it for me?
With this setup you can choose to add scss defaults (sass templates) stored in an other npm package. That means you can share base sass configuration between different projects and not reinvent the wheel al the time.

### When will it run?
The plugin will run both on `snowpack dev` and `snowpack build` command.

## Get started
```bash
npm i -D snowpack-plugin-sass-compiler
```

## Configure the plugin

#### snowpack.config.js
```js
module.exports = {
  plugins: [
    ["snowpack-plugin-sass-compiler", {
      outputPath: `some/desired/dir/including-filename.css`, // Type: string, default: public/css-site/styles.css
      targetDirectory: ['src'], // Type: array. default: ['src']
      scssOptions: {
        outputStyle: 'compressed',
        includePaths: ['some-dir/to/included/scss/docs'], // Type: array. files where to locate included scss documents
        sourceMap: false,
      } // Type: object
    }],
  ],
}
```


## Example how to add scss defaults
In this example i will use [lb-styles](https://www.npmjs.com/package/lb-styles) as my defaults.

```bash
npm i -D snowpack-plugin-sass-compiler lb-styles
```

I will then copy the included scss variables into a local folders.
 ```bash
mkdir scss-settings && cp node_modules/lb-styles/settings scss-settings
```
Then i can modify the pre scss settings such as colors, fonts etc.

Finally i will attach my local scss settings to the plugin. I also attach both every scss file in my src folder and the defaults in the lb-styles package as target for the compiler.

#### snowpack.config.js
```js
module.exports = {
  plugins: [
    ["snowpack-plugin-sass-compiler", {
      targetDirectory: ["src", "node_modules/lb-styles/styles"],
      scssOptions: {
        includePaths: ['./scss-settings']
      }
    }],
  ],
}
```
