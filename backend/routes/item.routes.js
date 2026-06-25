import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, editItem,deleteItem , getItemByCity} from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

itemRouter.post(
  "/add-item",
  isAuth,
  upload.single("image"),
  addItem
);

itemRouter.put(
  "/edit-item/:itemId",
  isAuth,
  upload.single("image"),
  editItem
);

itemRouter.delete(
  "/delete-item/:itemId",
  isAuth,
  deleteItem
);

itemRouter.get("/get-by-city/:city",isAuth,getItemByCity);


export default itemRouter;