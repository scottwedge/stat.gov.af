import { Router } from 'express';
import { WidgetComponent } from '../components';
import * as jwtConfig from '../config/middleware/jwtAuth';

/**
 * @constant {express.Router}
 */
const router: Router = Router();

/**
 * GET method route 
 * @example http://localhost:PORT/node-api/queries/:id
 */
router.get('/one/:id', WidgetComponent.findOne);

/**
 * GET method route
 * @example http://localhost:PORT/node-api/all
 */
router.get('/all', WidgetComponent.findAll);

/**
 * POST method route
 * @example http://localhost:PORT/node-api/create
 */
router.post('/create', WidgetComponent.create);

/**
 * POST method route
 * @example http://localhost:PORT/node-api/bulk-add
 */
router.post('/bulk-add', WidgetComponent.bulkAdd);


/**
 * PUT method route
 * @example http://localhost:PORT/node-api/bulk-udpate
 */
router.put('/bulk-update', jwtConfig.isAuthenticated, WidgetComponent.bulkUpdate);


/**
 * DELETE method route
 * @example http://localhost:PORT/node-api/detach
 */
router.put('/detach', jwtConfig.isAuthenticated, WidgetComponent.detachWidgets);


/**
 * POST method route
 * @example http://localhost:PORT/node-api/find-by-dashboard/:id
 */
router.get('/find-by-dashboard/:id', WidgetComponent.findByDashboardId);


/**
 * POST method route
 * @example http://localhost:PORT/node-api/find-by-user/:id
 */
router.get('/find-by-user/:id', WidgetComponent.findByUserId);

/**
 * DELETE method route
 * @example  http://localhost:PORT/node-api/queries/:id
 */
router.delete('/remove/:id', WidgetComponent.remove);

/**
 * @export {express.Router}
 */
export default router;
