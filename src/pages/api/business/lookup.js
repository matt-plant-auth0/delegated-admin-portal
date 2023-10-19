import { ManagementClient } from "auth0";

const baseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const domain = new URL(baseUrl).hostname;

const managementClient = new ManagementClient({
  domain: domain,
  clientId: process.env.AUTH0_M2M_CLIENT_ID,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
  scope: process.env.AUTH0_M2M_SCOPES,
});

export default async function lookupBusiness(req, res) {
  const { name } = req.query;

  if (name === "" || name == null) {
    return res.status(400).json({ msg: "Business name is required." });
  }
  const params = { name: name };

  try {
    const org = await managementClient.organizations.getByName(params);
    return res.status(200).json(org);
  } catch (error) {
    if (error.statusCode == 404) {
      return res.status(404).json({ msg: "Business not found" });
    }
    console.log("Internal error ", error);
    return res.status(500).json({ msg: "Internal error." });
  }
}
