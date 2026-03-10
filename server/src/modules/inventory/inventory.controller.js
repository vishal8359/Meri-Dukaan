import asyncHandler from "../../lib/asyncHandler.js";
import * as inventoryService from "./inventory.service.js";

export const getInventory = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.getByStore(req.params.id);
  res.json({ inventory });
});
