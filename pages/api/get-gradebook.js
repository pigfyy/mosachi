import getGradebook from "@/lib/gradebook/getGradebook";

// api route for /api/get-gradebook

export default async function handler(req, res) {
  const { username, password, urlSubdomain } = req.query;

  const gradebook = await getGradebook(username, password, urlSubdomain);

  res.status(200).json(gradebook);
}
