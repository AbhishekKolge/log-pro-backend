const { StatusCodes } = require('http-status-codes');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;

const prisma = require('../../prisma/prisma-client');

const CustomError = require('../errors');
const customUtils = require('../utils');
const retrieveSchema = require('../retrieveSchema');

const showCurrentUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },
    select: retrieveSchema.user,
  });

  res.status(StatusCodes.OK).json({ user });
};

const uploadProfileImage = async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new CustomError.BadRequestError('No profile image uploaded');
  }

  const profileImage = req.files.image;

  try {
    if (!profileImage.mimetype.startsWith('image')) {
      throw new CustomError.BadRequestError('Please upload an image');
    }

    const maxSize = 1024 * 1024;

    if (profileImage.size >= maxSize) {
      throw new CustomError.BadRequestError(
        'Please upload profile image smaller than 1 MB'
      );
    }

    const result = await cloudinary.uploader.upload(profileImage.tempFilePath, {
      use_filename: true,
      folder: 'logpro/profile-images',
    });

    await fs.unlink(profileImage.tempFilePath);

    const { profileImageId: oldProfileImageId } = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
    });
    await prisma.user.update({
      data: {
        profileImage: result.secure_url,
        profileImageId: result.public_id,
      },
      where: {
        id: req.user.userId,
      },
    });

    if (oldProfileImageId) {
      await cloudinary.uploader.destroy(oldProfileImageId);
    }

    res.status(StatusCodes.OK).json({
      profileImage: { src: result.secure_url },
    });
  } catch (error) {
    await fs.unlink(profileImage.tempFilePath);
    throw error;
  }
};

const removeProfileImage = async (req, res) => {
  const {
    query: { profileImageId },
    user: { userId },
  } = req;

  if (!profileImageId) {
    throw new CustomError.BadRequestError('Please provide profile image id');
  }

  const user = await prisma.user.findUnique({
    where: {
      profileImageId,
      id: userId,
    },
  });

  if (!user) {
    throw new CustomError.NotFoundError(
      `No profile image found with id of ${profileImageId}`
    );
  }

  await prisma.user.update({
    data: { profileImage: null, profileImageId: null },
    where: {
      id: userId,
    },
  });

  await cloudinary.uploader.destroy(profileImageId);

  res.status(StatusCodes.OK).json({
    msg: 'Profile image removed successfully',
  });
};

const updateUser = async (req, res) => {
  await prisma.user.update({
    data: req.body,
    where: {
      id: req.user.userId,
    },
  });

  res.status(StatusCodes.OK).json({
    msg: 'Profile updated successfully',
  });
};

const deleteUser = async (req, res) => {
  const { userId } = req.user;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new CustomError.NotFoundError(`No user found with id of ${userId}`);
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  if (user.profileImageId) {
    await cloudinary.uploader.destroy(user.profileImageId);
  }

  res.cookie('token', 'logout', {
    httpOnly: true,
    maxAge: 0,
  });

  res.status(StatusCodes.OK).json({
    msg: 'Account deleted successfully',
  });
};

const generateLoggerKey = async (req, res) => {
  const { userId } = req.user;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (user.key) {
    throw new CustomError.ConflictError('Logger key already generated');
  }

  const key = customUtils.createRandomKey();

  await prisma.user.update({
    data: { key },
    where: {
      id: req.user.userId,
    },
  });

  res.status(StatusCodes.OK).json({
    key,
  });
};

module.exports = {
  showCurrentUser,
  uploadProfileImage,
  removeProfileImage,
  updateUser,
  deleteUser,
  generateLoggerKey,
};
