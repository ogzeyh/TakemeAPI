import { Router } from 'express';
import { createUrl, editUrl, deleteUrl, getAllUrls, getUrlByShortCode } from '../controllers/url';

const router = Router();

router.get('/', getAllUrls);
router.get('/getUrl/', getUrlByShortCode);
router.post('/', createUrl);
router.put('/:urlId', editUrl);
router.delete('/:urlId', deleteUrl);

export default router;