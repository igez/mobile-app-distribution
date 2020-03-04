const path = require('path')
const StreamZip = require('node-stream-zip');
const plist = require('plist');
const fs = require('fs')
const pngdefry = require('pngdefry')
const mv = require('mv');

const [manifestPath] = process.argv.slice(2);

const zip = new StreamZip({
    file: path.join(__dirname, '../', manifestPath),
    storeEntries: true
});

const plistKeys = {
  appId: 'CFBundleIdentifier',
  appName: 'CFBundleName',
  buildNumber: 'CFBundleVersion',
  version: 'CFBundleShortVersionString',
}

const filename = manifestPath.replace(/^.*[\\\/]/, '');
const fileId = filename.substring(0, filename.length - 4);

const regexes = {
  AppIcon: /^Payload\/(.*).app\/(AppIcon60x60@3x.png)$/g,
  InfoPlist: /^Payload\/(.*).app\/Info.plist$/g
}

const tmpDir = path.join(__dirname, '../', 'tmp');

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

async function defryImage(extractedFilePath) {
  return new Promise((resolve, reject) => {
    pngdefry(extractedFilePath, path.join(tmpDir, `${fileId}_output.png`), (err) => {
      if (err) {
        return reject(err);
      }

      resolve(path.join(tmpDir, `${fileId}_output.png`))
    });
  })
}

async function extractFile(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    zip.extract(inputPath, outputPath, async err => {
      if (err) {
        return reject(err)
      }

      resolve(outputPath)
    });
  })
}

const moveFile = (a, b) => {
  return new Promise((resolve, reject) => {
    // Using mv due to EXDEV: cross-device link not permitted in fs.rename
    // https://stackoverflow.com/questions/44146393/error-exdev-cross-device-link-not-permitted-rename-nodejs
    mv(a, b, (err) => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}

zip.on('ready', async () => {
  let data = {}
  for (const entry of Object.values(zip.entries())) {
    if (regexes.AppIcon.test(entry.name)) {
      const extractedFilePath = path.join(tmpDir, fileId);
      const friedAppIcon = await extractFile(entry.name, extractedFilePath);
      const appIcon = await defryImage(friedAppIcon);

      if (!fs.existsSync(path.join(__dirname, '../', 'public/icons'))) {
        fs.mkdirSync(path.join(__dirname, '../', 'public/icons'))
      }

      try {
        await moveFile(appIcon, path.join(__dirname, '../', 'public/icons', `${fileId}.png`))
      } catch (err) {
        throw new Error(`Failed to rename!\n${err}`)
      }

      data.thumbnail = `%APP_URL%/icons/${fileId}.png`;
    }

    if (regexes.InfoPlist.test(entry.name)) {
      const extractedFilePath = path.join(tmpDir, `${fileId}.plist`);
      const extractedPlist = await extractFile(entry.name, extractedFilePath);
      const info = plist.parse(fs.readFileSync(extractedPlist, 'utf8'))

      data = Object.keys(plistKeys).reduce((o, key) => ({
        ...o,
        [key]: info[plistKeys[key]]
      }), data)
    }
  }

  // Cleanups!
  const files = fs.readdirSync(tmpDir);

  files
    .filter(name => new RegExp(`^${fileId}(.*)?.(png|plist)$`, 'g').test(name))
    .map(d => path.join(tmpDir, d))
    .forEach(fs.unlinkSync);

  console.log(JSON.stringify(data))

  // Do not forget to close the file once you're done
  zip.close()
});
