import { Router, Request, Response } from 'express';
import { downloadZip, getTTS, multiDownload } from '../controllers/tts.ctrl';

export const textToAudioRoutes = Router();

textToAudioRoutes.route('/').get((req: Request, res: Response) => {
  return res.status(200).send('Get t2a/');
});

textToAudioRoutes.route('/get').get(getTTS);
textToAudioRoutes.route('/multi').post(multiDownload);
textToAudioRoutes.route('/download').get(downloadZip);

export default textToAudioRoutes;
