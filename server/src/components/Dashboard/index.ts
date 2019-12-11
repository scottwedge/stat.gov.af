import DashboardService from './service';
import { HttpError } from '../../config/error';
import { IDashboardModel } from './model';
import { NextFunction, Request, Response } from 'express';
import WidgetService from '../Widget/service';
import { IWidgetModel } from '../Widget/model';
import * as _ from 'lodash';

/**
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise < void >}
 */
export async function findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const queries: IDashboardModel[] = await DashboardService.findAll();

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
        const query: IDashboardModel = await DashboardService.findOne(req.params.id);

        console.log('ERequest Params Id: ', req.params.id);
        

        console.log('Query: ', query);
        

        const widgetIds: any = query.widgets;

        console.log('Widget IDs: ', widgetIds);

        // Fetch widgets for the current dashboard
        let widgets: IWidgetModel[] = await WidgetService.findAllByIds(widgetIds);


        // Send only the grid for this specific dashboard
        widgets = widgets.map((w: any) => {
            const wGrid: any = w.gridstack.filter((wg: any) => wg.dashboardId === req.params.id
            )[0].gridstack;

            // It wont work if we copy or clone it directly, first make it string and then copy it
            let t: any = JSON.stringify(w);

            t = JSON.parse(t);

            // send only grid to match the general method of grid rendering in the frontend
            t.gridstack = wGrid;

            return t;
        });


        res.status(200).json({
            widgets,
            id: query.id,
            user: query.user,
            name: query.name,
            layout: query.layout,
            createdAt: query.createdAt,
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
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("DATA", req.body);

    try {
        const query: IDashboardModel = await DashboardService.insert(req.body);

        res.status(201).json(query);
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
        const query: IDashboardModel = await DashboardService.remove(req.params.id);

        res.status(200).json(query);
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
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const query: IDashboardModel = await DashboardService.update(req.params.id, req.body);

        res.status(200).json(query);
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

        const dashboards: IDashboardModel[] = await DashboardService.findAllByUserId(userId);

        console.log('req params: ', req.params.id);

        res.status(200).json({
            dashboards,
            message: 'charts successfully fetched'
        });
    } catch (error) {
        next(new HttpError(error.message.status, error.message));
    }
}
