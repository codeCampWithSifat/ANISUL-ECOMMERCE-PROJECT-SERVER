import jwt from "jsonwebtoken";

const createJSONWebToken = (payload, secretKey, expiresIn) => {
  if (typeof payload !== "object" || !payload) {
    throw new Error("Payload must be a non-empty string");
  }
  if (typeof secretKey !== "string" || secretKey === "") {
    throw new Error("Payload must be a non-empty string");
  }
  try {
    const token = jwt.sign(payload, secretKey, { expiresIn });
    return token;
  } catch (error) {
    console.log(`Failed To Sign In JWT`, error);
    throw error;
  }
};

export { createJSONWebToken };
