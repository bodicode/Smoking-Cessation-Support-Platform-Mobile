import { gql } from "@apollo/client";

export const GET_STREAK_LEADERBOARD = gql`
  query StreakLeaderboard($limit: Int, $offset: Int) {
    streakLeaderboard(limit: $limit, offset: $offset) {
      data {
        rank
        userId
        name
        streak
      }
      total
      myRank {
        rank
        userId
        name
        streak
      }
    }
  }
`; 