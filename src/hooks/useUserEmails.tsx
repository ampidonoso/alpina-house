// useUserEmails hook - placeholder since get_user_emails_by_ids function doesn't exist

export interface UserEmailData {
  email: string;
  last_sign_in_at: string | null;
}

export function useUserEmails(userIds: string[]) {
  // The RPC function get_user_emails_by_ids doesn't exist in the database
  // Return empty data to avoid errors
  return {
    data: {} as Record<string, UserEmailData>,
    isLoading: false,
    error: null,
  };
}
