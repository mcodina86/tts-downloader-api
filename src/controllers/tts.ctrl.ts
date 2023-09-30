import { Request, Response } from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { Audio } from '../types/audios.type';

export const downloadZip = (req: Request, res: Response) => {
  if (!req.query.file) {
    return res.status(403).send('Error.');
  }

  const name: string = req.query.file as string;
  const zipPath = getFilePath(name);
  return res.download(zipPath, name, () => {
    fs.unlink(zipPath, () => {
      return;
    });
  });
};

export const multiDownload = async (req: Request, res: Response) => {
  if (!req.body.texts || typeof req.body.texts !== 'object') {
    return res.status(403).send('Error.');
  }

  const texts: string[] = req.body.texts;
  const zipName = prepareFileName('multi', 'zip');
  const fileNames: string[] = [];
  const filesMeta: Audio[] = [];
  const zip = new AdmZip();
  for (const text of texts) {
    const preparedText = text.trim().toLowerCase();
    const name = prepareFileName(preparedText);
    const base64 = getBase64(preparedText);
    const fileName = getFilePath(name);
    const url = getUrl(text);
    fileNames.push(fileName);
    try {
      await downloadPromise(url, fileName);
      const meta: Audio = { base64, file: name, langCode: 'es', text };
      zip.addLocalFile(fileName);
      filesMeta.push(meta);
    } catch (error) {
      console.log(error);
    }
  }

  if (fileNames.length > 0) {
    const zipPath = getFilePath(zipName);
    zip.writeZip(zipPath, (err) => {
      if (!err) {
        fileNames.forEach((n) => {
          fs.unlink(n, () => {
            return;
          });
        });
      }
    });
    return res.status(200).send(zipName);
  }

  return res.status(200).send('');
};

export const getTTS = (req: Request, res: Response) => {
  if (!req.query.text) {
    return res.status(403).send('Error.');
  }

  const text: string = req.query.text as string;
  const preparedText = text.trim().toLowerCase();
  const name = prepareFileName(preparedText);
  const dest = getFilePath(name);
  const base64 = getBase64(preparedText);

  const url = getUrl(text);

  download(url, dest, (err: any) => {
    if (!err) {
      return res.download(dest, name, () => {
        if (err) {
          console.log(err);
        }
        fs.unlink(dest, () => {
          return;
        });
      });
    } else {
      return res.status(400).send(err);
    }
  });
};

const getUrl = (text: string) => process.env.TTS_URL + encodeURI(text);

const getFilePath = (name: string): string => {
  const dest = path.join(__dirname, '../../files/') + name;
  return dest;
};

const prepareFileName = (text: string, ext: string = 'mp3'): string => {
  const preparedText = text.trim().toLowerCase();
  const date = new Date();
  const unixTime = date.getTime();
  const name =
    unixTime +
    '_' +
    preparedText
      .normalize('NFKC')
      .replace(/[^a-z0-9-._ ]/g, '')
      .replace(/[ ]/g, '_')
      .substring(0, 20) +
    '.' +
    ext;

  return name;
};

const download = (url: string, dest: string, cb: any) => {
  const file = fs.createWriteStream(dest);

  const request = https.get(url, (response) => {
    // check if response is success
    if (response.statusCode !== 200) {
      return cb('Response status was ' + response.statusCode);
    }

    response.pipe(file);
  });

  // close() is async, call cb after close completes
  file.on('finish', () => {
    console.log('Finished');
    file.close(cb);
  });

  // check for request error too
  request.on('error', (err) => {
    console.log('1');
    console.log(err);
    fs.unlink(dest, () => cb(err.message)); // delete the (partial) file and then return the error
  });

  file.on('error', (err) => {
    console.log('2');
    console.log(err);
    // Handle errors
    fs.unlink(dest, () => cb(err.message)); // delete the (partial) file and then return the error
  });
};

const downloadPromise = (url: string, dest: string) =>
  new Promise((resolve, reject) => {
    download(url, dest, (r: any) => {
      if (r) {
        return reject(r);
      }
      return resolve(0);
    });
  });

const getBase64 = (text: string): string => {
  let buff = Buffer.from(text);
  let base64data = buff.toString('base64');
  return base64data;
};
