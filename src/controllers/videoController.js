const Video = require("../models/Video");
const Channel = require("../models/Channel");

const getVideos = async (req, res, next) => {
  const search = req.query.search;
  try {
    let videos = [];
    if (search) {
      videos = await Video.find({ title: { $regex: search, $options: "i" } });
    } else {
      videos = await Video.find();
    }

    const l_videos = await fetchChannelInfos(videos);
    if (videos) {
      res.status(200).json(l_videos);
    } else {
      res.status(203).json("No video record found.");
    }
  } catch (error) {
    next(error);
  }
};

const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { views: 1 } },
      { new: true }
    );

    const l_channel = await Channel.findById(
      video.channelId,
      "name profile subscribers" // only fetch this infos from the user
    ).exec();

    const { _id, ...channel } = l_channel._doc;
    res.status(200).json({ ...video._doc, ...channel });
  } catch (error) {
    next(error);
  }
};

const getVideosByChannelId = async (req, res, next) => {
  const channelId = req.params.id;
  try {
    const videos = await Video.find({ channelId });
    const l_videos = await fetchChannelInfos(videos);
    if (videos) {
      res.status(200).json(l_videos);
    } else {
      res.status(203).json("No video record found.");
    }
  } catch (error) {
    next(error);
  }
};

const createVideo = async (req, res, next) => {
  try {
    console.log("Request body:", req.body); 
    const l_video = new Video({ channelId: req.channel.id, ...req.body });
    const savedVideo = await l_video.save();
    const l_channel = await Channel.findById(savedVideo.channelId);

    await l_channel.updateOne({ $push: { videos: savedVideo._id.toString() } });

    const channel = {
      name: l_channel.name,
      profile: l_channel.profile,
      subscribers: l_channel.subscribers,
    };

    res.status(200).json({ ...savedVideo._doc, ...channel });
  } catch (error) {
    next(error);
  }
};

const updateVideo = async (req, res, next) => {
  try {
    const l_video = await Video.findById(req.params.id);
    if (!l_video) return res.status(404).json("Video not found");
    if (req.channel.id === l_video.channelId) {
      const updatedVideo = await Video.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      const l_channel = await Channel.findById(
        l_video.channelId,
        "name profile subscribers" // only fetch this infos from the user
      ).exec();

      const { _id, ...channel } = l_channel._doc;
      res.status(200).json({ ...updatedVideo._doc, ...channel });
    } else {
      return res.status(403).json("Update videos other channels not allowed.");
    }
  } catch (error) {
    next(error);
  }
};

const deleteVideo = async (req, res, next) => {
  try {
    const l_video = await Video.findById(req.params.id);
    if (!l_video) return res.status(404).json("Video not found");
    if (req.channel.id === l_video.channelId) {
      const l_channel = await Channel.findById(l_video.channelId);
      if (l_channel.videos.includes(l_video._id.toString())) {
        await l_channel.updateOne({
          $pull: { videos: l_video._id.toString() },
        });
      }
      await l_video.deleteOne();
      res.status(200).json("Video has been deleted.");
    } else {
      return res.status(403).json("Delete videos other channels not allowed.");
    }
  } catch (error) {
    next(error);
  }
};

const likeVideo = async (req, res, next) => {
  try {
    const channelId = req.channel.id;
    const videoId = req.params.videoId;

    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { likes: channelId },
      $pull: { dislikes: channelId },
    });

    res.status(200).json("Video liked.");
  } catch (error) {
    next(error);
  }
};

const dislikeVideo = async (req, res, next) => {
  try {
    const channelId = req.channel.id;
    const videoId = req.params.videoId;

    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { dislikes: channelId },
      $pull: { likes: channelId },
    });

    res.status(200).json("Video disliked.");
  } catch (error) {
    next(error);
  }
};

const fetchChannelInfos = async (videos) => {
  let results = [];

  if (videos.length == 0) return results;

  for (const video of videos) {
    const l_channel = await Channel.findById(
      video.channelId,
      "name profile subscribers" // only fetch this infos from the user
    ).exec();

    const { _id, ...channel } = l_channel._doc;
    results.push({ ...video._doc, ...channel });
  }

  return results;
};

const getVideoHistory = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in the request object
    const videoHistory = await Video.find({ userId }).sort({ watchedAt: -1 });

    if (videoHistory.length > 0) {
      const l_videos = await fetchChannelInfos(videoHistory);
      res.status(200).json(l_videos);
    } else {
      res.status(203).json("No video history found.");
    }
  } catch (error) {
    console.error('Error fetching video history:', error);
    next(error);
  }
};

module.exports = {
  getVideo,
  getVideos,
  getVideosByChannelId,
  createVideo,
  updateVideo,
  deleteVideo,
  likeVideo,
  dislikeVideo,
  getVideoHistory
};