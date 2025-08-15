// Admin dashboard statistics function
import { userAPI } from '../userFunctions';

export async function getAdminDashboardStats() {
  try {
    console.log('📊 Fetching admin dashboard stats...');
    
    // Get comprehensive stats from user API
    const stats = await userAPI.dashboard.getStats();
    const recentActivity = await userAPI.dashboard.getRecentActivity();
    
    // Transform for admin dashboard format
    const adminStats = {
      totalUsers: stats.totalUsers || 0,
      totalProperties: stats.totalProperties || 0,
      activeConversations: stats.totalConversations || 0,
      
      // Additional admin metrics
      completedIntakes: stats.completedIntakes || 0,
      completedConsultations: stats.completedConsultations || 0,
      completedPhotos: stats.completedPhotos || 0,
      
      // Financial metrics
      averagePropertyValue: stats.averageEstimatedValue || 0,
      propertiesWithValue: stats.propertiesWithEstimatedValue || 0,
      
      // Task metrics
      totalIncompleteTasks: stats.totalIncompleteTasks || 0,
      
      // Recent activity
      recentProperties: recentActivity.recentProperties || [],
      recentConversations: recentActivity.recentConversations || []
    };
    
    console.log('✅ Admin stats fetched successfully:', adminStats);
    
    return {
      success: true,
      data: adminStats
    };
    
  } catch (error) {
    console.error('❌ Error fetching admin dashboard stats:', error);
    
    // Return fallback data in case of error
    const fallbackStats = {
      totalUsers: 'Error',
      totalProperties: 'Error', 
      activeConversations: 'Error',
      completedIntakes: 0,
      completedConsultations: 0,
      completedPhotos: 0,
      averagePropertyValue: 0,
      propertiesWithValue: 0,
      totalIncompleteTasks: 0,
      recentProperties: [],
      recentConversations: []
    };
    
    return {
      success: false,
      error: error.message,
      data: fallbackStats
    };
  }
}

export default getAdminDashboardStats;