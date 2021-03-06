import WidgetService from './service';
import { HttpError } from '../../config/error';
import { IWidgetModel } from './model';
import { NextFunction, Request, Response } from 'express';

/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise < void >}
 */
export async function findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const queries: IWidgetModel[] = await WidgetService.findAll();

        res.status(200).json(queries);
    } catch (error) {
        next(new HttpError(error.message.status, error.message));
    }
}

/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise < void >}
 */
export async function findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const widget: IWidgetModel = await WidgetService.findOne(req.params.id);

        res.status(200).json(widget);
    } catch (error) {
        next(new HttpError(error.message.status, error.message));
    }
}

/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise < void >}
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        console.log(JSON.stringify(req.body));

        const widget: IWidgetModel = await WidgetService.insert(req.body);

        res.status(201).json(widget);
    } catch (error) {
        next(new HttpError(error.message.status, error.message));
    }
}

/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise < void >}
 */
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const widget: IWidgetModel = await WidgetService.remove(req.params.id);

        res.status(200).json(widget);
    } catch (error) {
        next(new HttpError(error.message.status, error.message));
    }
}

/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise < void >}
 */
export async function bulkAdd(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        let passFlag: boolean = true;
        const ids: any = [];

        console.log('body: ', JSON.stringify(req.body));

        for (let i = 0; i < req.body.length; i++) {
            const widget: IWidgetModel = await WidgetService.insert(req.body[i]);

            if (!widget) {
                passFlag = false;

                return;
            }
            console.log(widget._id);

            ids.push(widget._id);
        }

        if (passFlag) {
            console.log('Array: ', ids);

            res.status(200).json({
                ids,
                message: 'charts successfully saved',
            });
        } else {
            res.status(500).json({
                message: 'some error has occured'
            });
        }

    } catch (error) {
        next(new HttpError(error.message.status, error.message));
    }
}


/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise < void >}
 */
export async function bulkUpdate(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
        let passFlag: boolean = true;
        let resMsg: String = '';
        const ids: any = [];
        const dashboardId: String = req.body.dashboardId;


        for (let i = 0; i < req.body.grids.length; i++) {
            console.log(req.body.grids[i].id);

            const wID: string = req.body.grids[i].id;

            const widget: IWidgetModel = await WidgetService.findOne(wID);

            if (widget) {

                widget.gridstack.map((g: any) => {
                    if (g.dashboardId === dashboardId) {
                        g.gridstack = JSON.parse(req.body.grids[i].gridstack);
                    }
                });

                const uWidget: IWidgetModel = await WidgetService.update(wID, widget);

                if (!uWidget) {
                    passFlag = false;
                    resMsg = `Widget could not be updated, ID:  ${wID}`;
                    break;
                } else {
                    ids.push(wID);
                }
            } else {
                passFlag = false;
                resMsg = `Widget could not be found, ID: ${wID}`;
                break;
            }
        }

        if (passFlag) {
            res.status(200).json({
                ids,
                message: 'charts successfully saved',
            });
        } else {
            res.status(500).json({
                message: resMsg
            });
        }

    } catch (error) {
        next(new HttpError(error.message.status, error.message));
    }
}


/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise < void >}
 */
export async function detachWidgets(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
        let passFlag: boolean = true;
        let resMsg: String = '';
        const ids: any = [];
        const dashboardId: String = req.body.dashboardId;


        for (let i = 0; i < req.body.wIds.length; i++) {
            console.log('I Index: ', i);

            console.log(req.body.wIds[i]);

            const wID: string = req.body.wIds[i];

            const widget: IWidgetModel = await WidgetService.findOne(wID);

            if (widget) {
                console.log('Before Filter: ', JSON.stringify(widget.gridstack));

                widget.gridstack = widget.gridstack.map((g: any) => g.dashboardId !== dashboardId);

                if (!widget.gridstack[0]) {
                    widget.gridstack = [];
                }

                console.log('After Filter: ', widget.gridstack);

                const uWidget: IWidgetModel = await WidgetService.update(wID, widget);

                if (!uWidget) {
                    passFlag = false;
                    resMsg = `Widget could not be updated, ID:  ${wID}`;
                    break;
                } else {
                    ids.push(wID);
                }
            } else {
                passFlag = false;
                resMsg = `Widget could not be found, ID: ${wID}`;
                break;
            }
        }

        if (passFlag) {
            res.status(200).json({
                ids,
                message: 'charts successfully detached',
            });
        } else {
            res.status(500).json({
                message: resMsg
            });
        }

    } catch (error) {
        next(new HttpError(error.message.status, error.message));
    }
}

/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise < void >}
 */
export async function findByDashboardId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dashboardId = req.params.id;

        console.log('req params: ', req.params.id);

        res.status(200).json({
            message: 'charts successfully fetched',
        });
    } catch (error) {
        next(new HttpError(error.message.status, error.message));
    }
}


/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise < void >}
 */
export async function findByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.params.id;

        const widgets: IWidgetModel[] = await WidgetService.findAllByUserId(userId);

        console.log('req params: ', req.params.id);

        res.status(200).json({
            widgets,
            message: 'charts successfully fetched'
        });
    } catch (error) {
        next(new HttpError(error.message.status, error.message));
    }
}
