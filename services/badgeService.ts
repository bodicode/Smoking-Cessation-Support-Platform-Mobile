import { GET_MY_AWARDED_BADGES } from "@/graphql/query/getMyBadge";
import client from "@/libs/apollo-client";
import { GetMyAwardedBadgesResponse, UserBadge } from "@/types/api/badge";

export const BadgeService = {
  async getMyAwardedBadges(
    params = { page: 1, limit: 10 },
    filters = {}
  ): Promise<UserBadge[]> {
    try {
      const { data, error } = await client.query<GetMyAwardedBadgesResponse>({
        query: GET_MY_AWARDED_BADGES,
        variables: { params, filters },
        fetchPolicy: "network-only",
      });

      if (error) {
        throw new Error(error.message);
      }

      const awardedBadges = data?.myBadges?.data || [];

      return awardedBadges;
    } catch (e) {
      throw e;
    }
  },
};
