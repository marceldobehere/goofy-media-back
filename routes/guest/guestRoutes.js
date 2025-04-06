import express from 'express';
import registerRouter from './register.js';
import encStorageRouter from './encStorage.js';

const router = express.Router();
export default router;


router.use('/register', registerRouter);
router.use('/enc', encStorageRouter);