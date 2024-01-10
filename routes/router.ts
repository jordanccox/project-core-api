import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.type('json').send({ status: res.statusCode, message: 'Hello world!' });
});

export default router;
