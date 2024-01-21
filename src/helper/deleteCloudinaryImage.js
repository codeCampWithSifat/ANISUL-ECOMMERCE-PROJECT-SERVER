// https://res.cloudinary.com/dze2tntce/image/upload/v1705862087/AnisulEcommerceMern/users/hii9zabljmxcj8yta20p.png
const publicIdWithoutExtensionFromUrl = async (imageUrl) => {
  const pathSegments = imageUrl.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];
  const valueWithoutExtension = lastSegment.replace(".png", "");
  return valueWithoutExtension;
};

export { publicIdWithoutExtensionFromUrl };
