// https://res.cloudinary.com/dze2tntce/image/upload/v1705503179/opejnzstkidarkz2yntm.png
const publicIdWithoutExtensionFromUrl = async (imageUrl) => {
  const pathSegments = imageUrl.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];
  const valueWithoutExtension = lastSegment.replace(
    [".jpg", ".png", ".jpeg"],
    ""
  );
  return valueWithoutExtension;
};

export { publicIdWithoutExtensionFromUrl };
