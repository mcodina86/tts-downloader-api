import { Router, Request, Response } from 'express';
import translateRoutes from './translate.route';
import textToAudioRoutes from './tts.route';

const router = Router();

router.route('/').get((req: Request, res: Response) => {
  return res.status(200).send('');
});

router.use('/translate', translateRoutes);
router.use('/tts', textToAudioRoutes);

export default router;
