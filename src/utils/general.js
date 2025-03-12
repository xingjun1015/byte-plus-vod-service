const moment = require("moment");
const { ObjectId } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const os = require("os");
const puppeteer = require("puppeteer");
const locateChrome = require("locate-chrome");
const striptags = require("striptags");
const fs = require("fs");
const path = require("path");

const getHostname = () => {
  let hostname = process.env.SERVER_HOST;
  if (hostname == "http://localhost") {
    hostname = `${hostname}:${process.env.PORT}`;
  }

  return hostname;
};

const getObjectId = (_id) => {
  try {
    return _id ? new ObjectId(_id) : null;
  } catch (e) {
    console.log("getObjectId: ", e);
    return null;
  }
};

const consolidatePermissions = (permissions) => {
  if (!permissions) return [];
  if (permissions.length == 0) return permissions;

  const permissionList = permissions.reduce((acc, cur) => [...acc, ...cur.permission], []);

  // Consolidate permissions
  return Object.values(
    permissionList.reduce((acc, perm) => {
      const { module, ...permissions } = perm;

      if (!acc[module]) {
        acc[module] = { module, ...permissions };
      } else {
        // Dynamically check all permission fields
        for (const [key, value] of Object.entries(permissions)) {
          acc[module][key] = acc[module][key] || value;
        }
      }

      return acc;
    }, {}),
  );
};

const getSorting = (sortBy, sortOrder, defaultSortOption) => {
  const sortOptions = defaultSortOption || {};
  sortOptions[sortBy] = sortOrder == -1 ? parseInt(sortOrder) : 1;
  return sortOptions;
};

const getSkip = (currentPage, pageSize) => {
  return currentPage - 1 <= 0 ? 0 : (currentPage - 1) * pageSize;
};

const getBoolean = (value) => {
  return value === "true";
};

const apiAdminView = (req, module) => {
  try {
    const permissions = req.httpContext.permissions;
    const isAdmin = req.httpContext.isAdmin;

    if (!permissions) return false;

    const modulePermission = permissions.find((perm) => perm.module === module);

    return isAdmin || modulePermission.permissions.admin;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const dateFormatter = (date, formatPattern = "DD-MM-YYYY HH:mm") => {
  try {
    if (!date) {
      return "-";
    }

    // Format to Malaysia time for consistent output in local and production
    // Handle different date input formats
    let malaysiaDate;
    if (typeof date === "string" && date.match(/^\d{1,2}\s[A-Za-z]{3}\s\d{4}$/)) {
      // Handle "DD MMM YYYY" format (e.g., "15 Nov 2025")
      malaysiaDate = moment(date, "DD MMM YYYY").utcOffset("+08:00");
    } else {
      // Handle other formats (ISO strings, timestamps, etc.)
      malaysiaDate = moment(date).utcOffset("+08:00");
    }

    // Check if the date is valid
    if (!malaysiaDate.isValid()) {
      console.log(`Invalid date input: ${date}`);
      return "-";
    }

    return malaysiaDate.format(formatPattern);
  } catch (error) {
    console.log(error);
    return "-";
  }
};

const formattedDateTime = (date) => {
  return dateFormatter(date, "DD-MM-YYYY HH:mm");
};

const formattedDate = (date) => {
  return dateFormatter(date, "DD-MM-YYYY");
};

const formattedDateShortMonth = (date) => {
  return dateFormatter(date, "DD MMM YYYY");
};

const generate6DigitUUID = () => {
  return uuidv4().replace(/\D/g, "").slice(0, 6);
};

const isLinux = () => {
  return os.platform() === "linux";
};

const initPuppeteer = async () => {
  const executablePath = (await new Promise((resolve) => locateChrome((arg) => resolve(arg)))) || "";
  const puppeteerLunchOptions = {
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };
  let browser;

  if (isLinux()) {
    browser = await puppeteer.launch(puppeteerLunchOptions);
  } else {
    browser = await puppeteer.launch();
  }

  return browser;
};

const notEmptyHTMLContent = (content) => {
  return striptags(content).trim().length > 0;
};

const checkFieldNotNull = (arr, field) => {
  if (!arr || !field) return false;
  return arr.some((item) => {
    return item[field] !== null && item[field].length > 0;
  });
};

/**
 * Retrieves the value from a nested object using a dot-separated key string.
 *
 * @function getNestedValue
 * @param {Object} data - The object to retrieve the value from.
 * @param {string} key - The dot-separated key string to access the nested value.
 * @returns {*} - The value from the nested object, or null if the key is invalid.
 */
const getNestedValue = (data, key) => {
  try {
    const keys = key.split(".");
    let current = data;

    keys.forEach((k, index) => {
      // If k has [number] at the back, that means the index of that k
      const arrayIndexMatch = k.match(/(.+)\[(\d+)\]$/);

      if (arrayIndexMatch) {
        const arrayKey = arrayIndexMatch[1];
        const arrayIndex = parseInt(arrayIndexMatch[2], 10);

        current = current[arrayKey][arrayIndex];
      } else {
        current = current[k];
      }
    });

    return current;
  } catch (error) {
    console.log(error);

    return null;
  }
};

/**
 * Sets the value in a nested object using a dot-separated key string.
 *
 * @function setNestedValue
 * @param {Object} data - The object to set the value in.
 * @param {string} key - The dot-separated key string to access the nested value.
 * @param {*} value - The value to set.
 */
const setNestedValue = (data, key, value) => {
  const keys = key.split(".");
  let current = data;

  keys.forEach((k, index) => {
    const arrayIndexMatch = k.match(/(.+)\[(\d+)\]$/);

    if (arrayIndexMatch) {
      const arrayKey = arrayIndexMatch[1];
      const arrayIndex = parseInt(arrayIndexMatch[2], 10);

      if (index === keys.length - 1) {
        current[arrayKey][arrayIndex] = value;
      } else {
        current = current[arrayKey][arrayIndex];
      }
    } else {
      if (index === keys.length - 1) {
        current[k] = value;
      } else {
        current = current[k];
      }
    }
  });
};

/**
 * Reads a file and returns its content as a base64 encoded string.
 *
 * @function getFileBase64
 * @param {string} filePath - The path to the file.
 * @returns {Promise<string>} - A promise that resolves to the base64 encoded string of the file content.
 */
const getFileBase64 = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath.startsWith(path.resolve(process.env.STORAGE_PATH))) {
      return Promise.reject(new Error("Invalid file path"));
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      const base64Data = data.toString("base64");
      resolve(base64Data);
    });
  });
};

module.exports = {
  getHostname,
  getObjectId,
  consolidatePermissions,
  getSorting,
  getSkip,
  getBoolean,
  apiAdminView,
  formattedDateShortMonth,
  generate6DigitUUID,
  isLinux,
  initPuppeteer,
  notEmptyHTMLContent,
  checkFieldNotNull,
  getNestedValue,
  setNestedValue,
  getFileBase64,
};
