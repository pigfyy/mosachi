import { withIronSessionApiRoute } from "iron-session/next";
import sessionOptions from "@/lib/sessionOptions";

// api route for /api/logout
async function handler(req, res) {
  req.session.destroy();
  await req.session.save();

  res.status(200).json("Logout successful");
}

export default withIronSessionApiRoute(handler, sessionOptions);
