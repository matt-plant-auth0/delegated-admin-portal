import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { ManagementClient } from "auth0";

const baseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const domain = new URL(baseUrl).hostname;

const managementClient = new ManagementClient({
  domain: domain,
  clientId: process.env.AUTH0_M2M_CLIENT_ID,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
  scope: process.env.AUTH0_M2M_SCOPES,
});

export default withApiAuthRequired(async function subscribe(req, res) {
  const { plan } = req.query;
  const plan_name = plan.toLowerCase() || "";
  const allowedPlans = ["personal", "team", "enterprise"];

  if (!allowedPlans.includes(plan_name)) {
    return res.status(400).json({ error: "Invalid plan name: " + plan_name });
  }

  const session = await getSession(req, res);
  const user_id = session.user.sub;

  try {
    const startDate = new Date();
    let endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 1);

    const app_metadata = {
      subscription_plan_start_date: startDate,
      subscription_plan_end_date: endDate,
      subscription_status: plan_name === "personal" ? "active" : "activation",
      subscription_plan: plan_name,
    };

    const user = await managementClient.users.updateAppMetadata(
      { id: user_id },
      app_metadata
    );

    return res.status(200).json(user);
  } catch (error) {
    if (error.statusCode == 404) {
      return res
        .status(404)
        .json({ msg: "Error updating subscription. User not found" });
    }
    console.log("Internal error ", error);
    return res.status(500).json({ msg: "Error updating subscription" });
  }
});
