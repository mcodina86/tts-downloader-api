import { Router, Request, Response } from 'express';

export const translateRoutes = Router();

translateRoutes.route('/').get((req: Request, res: Response) => {
  return res.status(200).send('Get translate/');
});

export default translateRoutes;
