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

export default withApiAuthRequired(async function organization(req, res) {
  const { org_name } = req.query;

  if (!org_name) {
    return res
      .status(400)
      .json({ msg: "Organization name identifier is required." });
  }

  const db_connection_meta = {
    name: "Username-Password-Authentication",
    strategy: "auth0",
    per_page: 1,
    page: 0,
  };

  const social_connection_meta = {
    name: "google-oauth2",
    strategy: "google-oauth2",
    per_page: 1,
    page: 0,
  };

  try {
    //scope > read:connections
    const dbConnection = await managementClient.connections.getAll(
      db_connection_meta
    );
    const socialConnection = await managementClient.connections.getAll(
      social_connection_meta
    );

    //scope > read:roles
    const allRoles = await managementClient.roles.getAll({
      per_page: 10,
      page: 0,
    });
    const adminRole = await allRoles.filter(
      (obj) => obj.name == "Administrator"
    );

    const session = await getSession(req, res);
    const user_id = session.user.sub;

    const startDate = new Date();
    let endDate = new Date();
    if(session.user.subscription_plan == 'trial'){
      endDate.setDate(startDate.getDate() + 21);
    }else{
      endDate.setFullYear(startDate.getFullYear() + 1);
    }

    const app_metadata = {
      subscription_plan: session.user.subscription_plan,
      subscription_plan_start_date: startDate,
      subscription_plan_end_date: endDate,
      subscription_status: "active",
    };

    const organization = {
      name: org_name,
      metadata: app_metadata,
      enabled_connections: [
        {
          connection_id: dbConnection[0].id,
          assign_membership_on_login: false,
        },
        {
          connection_id: socialConnection[0].id,
          assign_membership_on_login: false,
        },
      ],
    };

    //scopes: create:organizations, create:organization_connections
    const new_org = await managementClient.organizations.create(organization);

    const org_id = new_org.id;
    //scope: create:organization_members
    //Add user as member of the organization
    await managementClient.organizations.addMembers(
      { id: org_id },
      { members: [user_id] }
    );

    //scope: create:organization_member_roles
    //Add user as Administrator of the organization
    await managementClient.organizations.addMemberRoles(
      { id: org_id, user_id: user_id },
      { roles: [adminRole[0].id] }
    );

    //update user metadata
    const user = await managementClient.users.updateAppMetadata(
      { id: user_id },
      app_metadata
    );

    return res.status(200).json(new_org);
  } catch (error) {
    console.log("Failed to create organization: ", error);

    if (error.statusCode == 400) {
      return res.status(400).json({
        msg: "Invalid organization name. It may contain lowercase alphabetical characters, numbers, underscores (_), and dashes (-). Can start with a number. Must be between 3 and 50 characters.",
      });
    }

    if (error.statusCode == 404) {
      return res.status(404).json({ msg: "Failed to create organization." });
    }

    if (error.statusCode == 409) {
      return res.status(409).json({ msg: error.message });
    }
    return res.status(500).json({ msg: "Internal error" });
  }
});
