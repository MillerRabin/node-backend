import jwt_decode from "jwt-decode";
import jwt from "jsonwebtoken";
import { readJWTKeys } from  "./secrets.mjs";

const jwtKeys = readJWTKeys();

export function create(data) {
  const val = jwt.sign(data, jwtKeys.privateKey, { algorithm: "PS256" });
  return { token: val, user_id: data.id, voiceResult: data.voiceResult };    
};

export function verifyLocal(token) {
  try {
    jwt.verify(token, jwtKeys.publicKey, { algorithms: ["PS256"], ignoreExpiration: true });
  } catch {
    throw new Error('Invalid token');
  }
}

export function decode(tokenString) {
  const pToken = parseToken(tokenString);
  const token = jwt_decode(pToken);
  verifyLocal(pToken)
  return token;
};

export function getIdentity(token) {
  if (token.id != null) return { id: token.id, name: token.name };
  throw new Error('Invalid identity');
};

export default {
  getIdentity,
  decode,
  verifyLocal,
  create
}
