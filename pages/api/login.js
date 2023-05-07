import { withIronSessionApiRoute } from "iron-session/next";
import sessionOptions from "@/lib/sessionOptions";

// api route for /api/login
async function handler(req, res) {
  const { username, password, urlSubdomain } = req.query;

  req.session.user = { username, password, urlSubdomain };
  await req.session.save();

  res.status(200).json("Login data successfully saved in session");
}

export default withIronSessionApiRoute(handler, sessionOptions);
