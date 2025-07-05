import client from "@/libs/apollo-client";
import { GET_PLAN_TEMPLATES } from "@/graphql/query/getTemplate";
import { GET_PLAN_TEMPLATE_BY_ID } from "@/graphql/query/getTemplateById";

export const PlanTemplateService = {
  async getTemplates({
    page = 1,
    limit = 10,
    search = "",
    orderBy = "created_at",
    sortOrder = "desc",
  } = {}) {
    const variables: any = { page, limit, search, orderBy, sortOrder };
    const { data } = await client.query({
      query: GET_PLAN_TEMPLATES,
      variables,
      fetchPolicy: "network-only",
    });
    return data.cessationPlanTemplates.data;
  },

  async getTemplateById(id: string) {
    const { data } = await client.query({
      query: GET_PLAN_TEMPLATE_BY_ID,
      variables: { cessationPlanTemplateId: id },
      fetchPolicy: "no-cache",
    });
    return data.cessationPlanTemplate;
  },
};
