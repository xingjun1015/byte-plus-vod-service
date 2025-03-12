const path = require("path");
const fs = require("fs");
require("dotenv").config();

const uploadDir = path.resolve(process.env.STORAGE_PATH, "uploads");

const initLocalFileStorage = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

const validateFile = (fileName, allowedExtensions) => {
  try {
    const fileExtension = path.extname(fileName);
    allowedExtensions = allowedExtensions || [".jpg", ".jpeg", ".png", ".pdf", ".docx", ".doc"];

    if (!allowedExtensions.includes(fileExtension)) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const saveFile = (fileName, fileData, mimetype, dataPath = null, appendixId = null) => {
  try {
    // Decode Base64
    const buffer = Buffer.from(fileData, "base64");
    // Get file size
    const fileSizeInBytes = buffer.length;
    // Generate timestamp and random 4 numbers
    const timestamp = Date.now();
    const randomNumbers = Math.floor(1000 + Math.random() * 9000);
    const fileExtension = path.extname(fileName);
    const newFileName = `${timestamp}-${randomNumbers}${fileExtension}`;
    const outputPath = path.resolve(uploadDir, newFileName);

    // Save the file
    fs.writeFileSync(outputPath, buffer);

    return {
      originalName: fileName,
      name: newFileName,
      path: outputPath,
      size: fileSizeInBytes,
      mimetype: mimetype,
      dataPath: dataPath,
      appendixId: appendixId,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const validateThenSaveFile = (input, allowedExtensions = []) => {
  // Handle array of files
  if (Array.isArray(input)) {
    return input.map((item) => validateThenSaveFile(item, allowedExtensions));
  }

  // Handle single file
  if (input && input?.newFile && validateFile(input.name, allowedExtensions)) {
    input = saveFile(input.name, input.data, input.type, input.dataPath, input.appendixId);
  } else if (input?.newFile) {
    // Remove the newFile flag
    delete input.newFile;
  }

  return input;
};

initLocalFileStorage();

module.exports = {
  saveFile,
  uploadDir,
  validateFile,
  validateThenSaveFile,
};
