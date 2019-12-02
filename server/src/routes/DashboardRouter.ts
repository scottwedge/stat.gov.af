import { Router } from 'express';
import { DashboardComponent } from '../components';
import * as jwtConfig from '../config/middleware/jwtAuth';

/**
 * @constant {express.Router}
 */
const router: Router = Router();

/**
 * GET method route 
 * @example http://localhost:PORT/api/dashboards/:id
 */
router.get('/one/:id', DashboardComponent.findOne);

/**
 * GET method route
 * @example http://localhost:PORT/api/dashboards
 */
router.get('/all', DashboardComponent.findAll);

/**
 * POST method route
 * @example http://localhost:PORT/api/dashboards
 */
router.post('/create', DashboardComponent.create);

/**
 * DELETE method route
 * @example  http://localhost:PORT/api/dashboards/:id
 */
router.delete('/remove/:id', DashboardComponent.remove);


/**
 * UPDATE method route
 * @example  http://localhost:PORT/api/dashboards/:id
 */
router.put('/update/:id', DashboardComponent.update);


/**
 * POST method route
 * @example http://localhost:PORT/node-api/find-by-user/:id
 */
router.get('/find-by-user/:id', DashboardComponent.findByUserId);

/**
 * @export {express.Router}
 */
export default router;
