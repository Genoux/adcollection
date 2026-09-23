import type { Access } from "payload";

export const anyoneCanRead: Access = () => true;

export const nobody: Access = () => false;

export const localApiOnly = { read: nobody, create: nobody, update: nobody, delete: nobody };

export const onlyLoggedIn: Access = ({ req }) => Boolean(req.user);

export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};
