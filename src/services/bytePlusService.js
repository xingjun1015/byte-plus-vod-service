const { vodOpenapi } = require("@byteplus/vcloud-sdk-nodejs");
const crypto = require("crypto");
const axios = require("axios");

class BytePlusService {
  constructor({ bytePlusVodService }) {
    this.bytePlusVodService = bytePlusVodService;
  }

  getQueryObject(vid) {
    return {
      Vid: vid, // The video ID from the BytePlus VOD service
      FileType: "video", // Default is video. Supports: video, audio, evideo (for encrypted video), eaudio (for encrypted audio)
      Definition: "All", // Applicable when FileType is video and evideo. Supports: 240p, 360p, 480p, 540p, 720p, 1080p, 2k, 4k. All by default.
      Codec: "h264",
      Ssl: 1, // Indicates whether to return HTTPS address. 1: true, 0: false
    };
  }

  async getBytePlusInfo() {
    try {
      const region = process.env.BYTEPLUS_REGION;
      const appId = process.env.BYTEPLUS_APP_ID;
      const spaceName = process.env.BYTEPLUS_VOD_SPACE_NAME;
      const userId = process.env.BYTEPLUS_VOD_USER_ID;

      return {
        success: true,
        data: {
          region,
          appId,
          spaceName,
          userId,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to get BytePlus info",
      };
    }
  }

  async getVideoAuthToken({ vid }) {
    try {
      const tokenExpireTime = 3600; // Token expiration time in seconds, default is 3600 (1 hour)

      const query = this.getQueryObject(vid);
      const res = this.bytePlusVodService.GetPlayAuthToken(query, tokenExpireTime);

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

  async getVideoPlaybackUrl({ vid }) {
    try {
      const query = this.getQueryObject(vid);
      const res = await this.bytePlusVodService.GetPlayInfo(query);

      return {
        success: true,
        data: {
          url: res.Result.PlayInfoList[0].MainPlayUrl,
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
      const res = await this.bytePlusVodService.GetMediaList({
        SpaceName: process.env.BYTEPLUS_VOD_SPACE_NAME,
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

  async getUploadToken() {
    try {
      const tokenExpireTime = 30 * 60 * 1000; // 30minutes
      const uploadToken = this.bytePlusVodService.GetUploadToken(tokenExpireTime);

      return {
        success: true,
        data: {
          token: uploadToken,
          expires: tokenExpireTime,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to get upload token",
      };
    }
  }
}

module.exports = BytePlusService;
