export interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarUrl?: string;
  onEditPress?: () => void;
}