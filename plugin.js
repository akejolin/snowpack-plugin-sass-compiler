const compiler = require('node-sass');
const postcss = require('postcss');
const recursive = require('recursive-readdir')
const fs = require('fs')
const path = require('path')
const mergeFiles = require('merge-files')
const combineSelectors = require('postcss-combine-duplicated-selectors');

const pkg = require('./package.json')

const { extractFileInPath, extractDirInPath } = require('./utils.js')

const defaultScssOptions = {
  outputStyle: 'compressed',
  includePaths: ['./scss'],
  sourceMap: false,
}

const formatOptions = options => {
  const {
    outputPath,
    targetDirectory,
    scssOptions
  } = options || {}

  return {
    outputPath: typeof outputPath === 'string' && outputPath !== '' ? outputPath : 'public/css-site/styles.css',
    targetDirectory: Array.isArray(targetDirectory) && targetDirectory.length > 0 ? targetDirectory : ['src'],
    scssOptions: typeof scssOptions === 'object' ? Object.assign(defaultScssOptions, scssOptions) : defaultScssOptions,
  }
}

module.exports = function plugin(snowpackConfig, pluginOptions) {
  let isDev = true

  const { outputPath, targetDirectory, scssOptions } = formatOptions(pluginOptions)

  const render = async (filepath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          const extname = path.extname(filepath);
          compiler.render(
            Object.assign(
              scssOptions,
              { file: filepath,
                data,
                indentedSyntax: extname === '.sass',
              },
            ),
            (err, result) => {
              if (err) {
                reject(err)
              } else {
                resolve(result)
              }
            }
          );
        }
      });
    });
  }

  return {
    name: pkg.name,
    /*
    * Temporary remove all imports in scss files before running snowpack dev
    */
    async transform({filePath, fileExt, contents}) {
      const exts = ['.scss']
      if (exts.find(ext => ext === fileExt) && isDev) {
        return contents.replace(/@import/gi, `//@import`)
      }
      return
    },

    /*
    * Locate scss, merge and then compile them
    */
    async run(options) {
      isDev = !!options.isDev;
      try {
        // 1. Get all scss files within project
        let files = targetDirectory.map(file => {
          return recursive(file).then(files => files)
        })
        files = await Promise.all(files).then(res => res)
        files = files.flat(Infinity)

        files = files.map(file => {
          return {
            path: file,
            ...extractFileInPath(file)
          }
        }).filter(f => f.ext === 'scss')

        const outputDir = extractDirInPath(outputPath).str

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir)
        }

        // 2. Merge all files to one file
        const outputMerged = `${outputDir}/merged.scss`
        await mergeFiles(files.map(f => f.path), outputMerged).then((status) => {
          // 3. Compile scss to css.
          [outputMerged].forEach(async file => {
            const data = await render(file)

            // Temporary write css file
            fs.writeFile(`${outputDir}/temp.css`, data.css, () => {})

            // Merge and adjust CSS and remove duplications
            postcss([combineSelectors({removeDuplicatedProperties: true})])
            .process(data.css, {from: `${outputDir}/temp.css`, to: outputPath})
            .then((result) => {
              fs.writeFileSync(outputPath, result.css);
            });

            // remove merged source
            try {
              fs.unlink(outputMerged, (err) => {
                if (err) {
                  console.error(err)
                  return
                }
              })
              fs.unlink(`${outputDir}/temp.css`, (err) => {
                if (err) {
                  console.error(err)
                  return
                }
              })
            } catch(err) {
              console.error(err)
            }
          })
        })

        return
      } catch (err) {
        console.error(err)
      }
    },
    /*
    * clean up in build
    */
    async optimize({ buildDirectory }) {
      let files = await recursive(buildDirectory).then(files => files)
      files = files.map(file => {
        return {
          path: file,
          ...extractFileInPath(file)
        }
      }).filter(f => f.ext === 'scss')

      // remove

      files.forEach(file => {
        // remove found scss files in build
        try {
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error(err)
              return
            }
          })
        } catch(err) {
          console.error(err)
        }
      });

    }
  };
}
