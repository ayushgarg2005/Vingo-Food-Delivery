import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../Utils/cloudinary.js";

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address, lat, lng } = req.body;

    let shop = await Shop.findOne({
      owner: req.userId,
    });

    let image = shop?.image || "";

    
    if (req.file) {
       console.log("req.file =", req.file);
       console.log("path =", req.file.path);
      image = await uploadOnCloudinary(req.file.path);
      console.log("cloudinary image =", image);

      if (!image) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed. Please check your Cloudinary credentials and try again.",
        });
      }
    }
    
    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        lat,
        lng,
        image,
        owner: req.userId,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          lat,
          lng,
          image,
        },
        { new: true }
      );
    }
    
    await shop.populate("owner");
    
    return res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({
      owner: req.userId,
    }).populate("foodItems");
    
    if (!shop) {
      return res.status(404).json({
        message: "Shop not found",
      });
    }
    
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({
      message: `Get my shop error: ${error.message}`,
    });
  }
};


export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const shops = await Shop.find({
      city: {
        $regex: new RegExp(`^${city}$`, "i"),
      },
    }).populate("foodItems");

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shops found in this city",
      });
    }

    return res.status(200).json({
      success: true,
      shops,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching shops by city",
    });
  }
};