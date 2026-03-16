import { BaseApi } from './base.api';
import { ApiResponse, DashboardData, FamilyData, Member } from '../types';

export class HouseholdService extends BaseApi {
    // Dashboard
    async getDashboardData(): Promise<ApiResponse<DashboardData>> {
        return this.request<DashboardData>('/dashboard/page-data');
    }

    // Family
    async getFamilyData(): Promise<ApiResponse<FamilyData>> {
        return this.request<FamilyData>('/family/page-data');
    }

    // Members
    async createMember(memberData: {
        householdId: string;
        firstName: string;
        role: 'Parent' | 'Child';
        profileColor: string;
        displayName?: string;
    }): Promise<ApiResponse<{ member: Member }>> {
        return this.request<{ member: Member }>('/family/members', {
            method: 'POST',
            body: JSON.stringify(memberData),
        });
    }

    async updateMember(memberId: string, memberData: {
        householdId: string;
        firstName?: string;
        role?: 'Parent' | 'Child';
        profileColor?: string;
        displayName?: string;
    }): Promise<ApiResponse<{ member: Member }>> {
        return this.request<{ member: Member }>(`/family/members/${memberId}`, {
            method: 'PUT',
            body: JSON.stringify(memberData),
        });
    }

    async deleteMember(memberId: string, householdId: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/family/members/${memberId}`, {
            method: 'DELETE',
            body: JSON.stringify({ householdId }),
        });
    }

    // Focus Mode
    async setFocusTask(householdId: string, memberProfileId: string, taskId: string | null): Promise<ApiResponse<any>> {
        return this.request<any>(`/households/${householdId}/members/${memberProfileId}`, {
            method: 'PATCH',
            body: JSON.stringify({ focusedTaskId: taskId }),
        });
    }
}

export const householdService = new HouseholdService();
