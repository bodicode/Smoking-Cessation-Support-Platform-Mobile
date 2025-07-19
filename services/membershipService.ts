import { GET_MEMBERSHIPS } from "@/graphql/query/getMemberships";
import { GET_MEMBERSHIP_BY_ID } from "@/graphql/query/getMembershipById";
import client from "@/libs/apollo-client";
import { IMembershipPackage } from "@/types/api/membership";

export const MembershipService = {
  /**
   * Get all available membership packages
   */
  getMembershipPackages: async (): Promise<IMembershipPackage[]> => {
    try {
      const { data } = await client.query({
        query: GET_MEMBERSHIPS,
        fetchPolicy: "no-cache",
      });

      return data.getMembershipPackages || [];
    } catch (error: any) {
      console.error("Error fetching membership packages:", error);
      
      // Log more detailed error information
      if (error.graphQLErrors) {
        console.error("GraphQL Errors:", JSON.stringify(error.graphQLErrors, null, 2));
      }
      
      if (error.networkError) {
        console.error("Network Error:", error.networkError);
        
        // Log response details if available
        if (error.networkError.result) {
          console.error("Error result:", JSON.stringify(error.networkError.result, null, 2));
        }
        
        // Log status code if available
        if (error.networkError.statusCode) {
          console.error("Status code:", error.networkError.statusCode);
        }
      }
      
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      
      // Return mock data for now until the API is implemented
      return getMockMembershipPackages();
    }
  },

  /**
   * Get a specific membership package by ID
   */
  getMembershipPackageById: async (id: string): Promise<IMembershipPackage | null> => {
    try {
      const { data } = await client.query({
        query: GET_MEMBERSHIP_BY_ID,
        variables: { id },
        fetchPolicy: "network-only",
      });
      
      return data.membership;
    } catch (error) {
      console.error(`Error fetching membership package with id ${id}:`, error);
      // Return mock data for now until the API is implemented
      const mockPackages = getMockMembershipPackages();
      return mockPackages.find(pkg => pkg.id === id) || null;
    }
  }
};

// Mock data for development purposes
function getMockMembershipPackages(): IMembershipPackage[] {
  return [
    {
      id: '1',
      name: 'Gói Cơ bản',
      price: 0,
      description: 'Truy cập các tính năng cơ bản để bắt đầu hành trình cai thuốc của bạn.',
      duration_days: 0, // Unlimited
      features: [
        'Theo dõi tiến trình cai thuốc',
        'Truy cập nội dung cơ bản',
        'Ghi nhật ký sức khỏe'
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Gói Premium',
      price: 99000,
      description: 'Truy cập đầy đủ các tính năng cao cấp để tối ưu hóa quá trình cai thuốc.',
      duration_days: 30,
      features: [
        'Tất cả các tính năng của gói Cơ bản',
        'Phân tích chi tiết sức khỏe',
        'Các bài tập thiền độc quyền',
        'Hỗ trợ 24/7 từ chuyên gia'
      ],
      is_popular: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Gói Hội viên năm',
      price: 799000,
      description: 'Tiết kiệm hơn với gói thành viên hàng năm và nhận thêm nhiều ưu đãi.',
      duration_days: 365,
      features: [
        'Tất cả các tính năng của gói Premium',
        'Tiết kiệm 33% so với gói hàng tháng',
        'Nhận thêm 2 buổi tư vấn riêng',
        'Báo cáo sức khỏe nâng cao hàng tháng'
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}