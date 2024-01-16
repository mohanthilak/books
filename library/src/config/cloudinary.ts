const cloudinary = require("cloudinary").v2;
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Options } from "multer-storage-cloudinary";

import {CLOUDINARY_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY} from "./index"

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});


declare interface cloudinaryOptions extends Options {
params: {
folder: string
}
}

const multerOpts: cloudinaryOptions = {
    cloudinary: cloudinary,
    params: {
      folder: "zipper",
    },
};

export const storage = new CloudinaryStorage(multerOpts);

module.exports = {
  cloudinary,
  storage,
};