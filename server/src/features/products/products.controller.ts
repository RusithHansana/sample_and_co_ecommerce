import type { Request, Response } from "express";
import { productsService } from "./products.service.js";
import { sendSuccessResponse } from "../../utils/send-api-response.js";

class ProductsController {
    list = async (req: Request, res: Response) => {
        const {
            page,
            pageSize,
            search,
            category,
            attributes
        } = req.query

        const params = {
            page: page as number | undefined,
            pageSize: pageSize as number | undefined,
            search: search as string | undefined,
            category: category as string | undefined,
            attributes: attributes as Record<string, string> | undefined
        };

        const result = await productsService.listProducts(params);

        sendSuccessResponse(res, result.data, 200, result.pagination);
    }

    getById = async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };

        const result = await productsService.getProductById(id);

        sendSuccessResponse(res, result, 200);
    }
}

export const productsController = new ProductsController();