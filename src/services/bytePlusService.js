const { vodOpenapi } = require("@byteplus/vcloud-sdk-nodejs");
const crypto = require("crypto");
const axios = require("axios");

class BytePlusService {
  constructor({}) {}

  async getVideoAuthToken({ vid }) {
    try {
      const bytePlusAccessKey = process.env.BYTEPLUS_ACCESSKEY;
      const bytePlusSecretKey = process.env.BYTEPLUS_SECRETKEY;

      if (!bytePlusAccessKey || !bytePlusSecretKey) {
        throw new Error("BytePlus access key and secret key are required");
      }

      const vodService = vodOpenapi.defaultService;
      vodService.setAccessKeyId(bytePlusAccessKey);
      vodService.setSecretKey(bytePlusSecretKey);

      const tokenExpireTime = 3600; // Token expiration time in seconds, default is 3600 (1 hour)

      const query = {
        Vid: vid, // The video ID from the BytePlus VOD service
        FileType: "video", // Default is video. Supports: video, audio, evideo (for encrypted video), eaudio (for encrypted audio)
        Definition: "All", // Applicable when FileType is video and evideo. Supports: 240p, 360p, 480p, 540p, 720p, 1080p, 2k, 4k. All by default.
        Format: "your format",
        Codec: "h264",
        Ssl: 0, // Indicates whether to return HTTPS address. 1: true, 0: false
      };
      const res = vodService.GetPlayAuthToken(query, tokenExpireTime);

      return {
        success: true,
        data: {
          token: res,
          expires: tokenExpireTime,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to get video auth token",
      };
    }
  }

  async getMediaList() {
    try {
      const bytePlusAccessKey = process.env.BYTEPLUS_ACCESSKEY;
      const bytePlusSecretKey = process.env.BYTEPLUS_SECRETKEY;

      if (!bytePlusAccessKey || !bytePlusSecretKey) {
        throw new Error("BytePlus access key and secret key are required");
      }

      const vodService = vodOpenapi.defaultService;
      vodService.setAccessKeyId(bytePlusAccessKey);
      vodService.setSecretKey(bytePlusSecretKey);

      const res = await vodService.GetMediaList({
        SpaceName: "vod-testing",
        Status: "Published",
        // Vid: "string",
        // Order: "string",
        // Tags: "string",
        // StartTime: "string",
        // EndTime: "string",
        // Offset: "string",
        // PageSize: "string",
      });

      const mediaList = res.Result.MediaInfoList.map((item) => ({
        vid: item.BasicInfo.Vid,
        title: item.BasicInfo.Title,
        description: item.BasicInfo.Description,
        posterUri: item.BasicInfo.PosterUri,
        publishStatus: item.BasicInfo.PublishStatus,
        tags: item.BasicInfo.Tags,
        createTime: item.BasicInfo.CreateTime,
        fileType: item.SourceInfo.FileType,
        duration: item.SourceInfo.Duration,
        format: item.SourceInfo.Format,
        size: item.SourceInfo.Size,
      }));

      return {
        success: true,
        data: {
          mediaList: mediaList,
          total: res.Result.TotalCount,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to get video auth token",
      };
    }
  }
}

module.exports = BytePlusService;
