import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../Utils/cloudinary.js";

export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body;

    const shop = await Shop.findOne({
      owner: req.userId,
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    let image = "";

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    });

    await Shop.findByIdAndUpdate(
      shop._id,
      {
        $push: {
          foodItems: item._id,
        },
      }
    );

    return res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const editItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, category, foodType, price } = req.body;

    const existingItem = await Item.findById(itemId);

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const updateData = {
      name,
      category,
      foodType,
      price,
    };

    if (req.file) {
      updateData.image = await uploadOnCloudinary(req.file.path);
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const shop = await Shop.findOne({
      owner: req.userId,
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const item = await Item.findOne({
      _id: itemId,
      shop: shop._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    await Item.findByIdAndDelete(itemId);

    await Shop.findByIdAndUpdate(
      shop._id,
      {
        $pull: {
          foodItems: itemId,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    const shops = await Shop.find({
      city: {
        $regex: new RegExp(`^${city}$`, "i"),
      },
    }).populate("foodItems");

    const items = shops.flatMap(
      (shop) => shop.foodItems || []
    );

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching items",
    });
  }
};