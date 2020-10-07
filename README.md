# snowpack-plugin-sass-compiler
This small snowpack plugin will gather all your spread out `scss` files within `src` folder, merge them, compile them into `css` and store them in a desired ouput folder. Then it's up to you how you want to use the outputted css file. But the main idea is to link to the outputted file directly in the html file.

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
    ["snowpack-plugin-content-hash", {
      outputPath: `some/desired/dir/including-filename.css`, // Type: string, default: public/css-site/styles.css
      targetDirectory: ['src'], // Type: array. default: ['src']
      scssOptions: {
        outputStyle: 'compressed',
        includePaths: ['some-dir/to/included/scss/docs'], // files where to locate included scss documents
        sourceMap: false,
      } // Type: object
    }],
  ],
}
```
