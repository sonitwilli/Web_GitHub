import { Profile } from '@/lib/api/user';
import { ProfileProvider } from '@/lib/components/contexts/ProfileContext';
import UserDropdownMenu from '@/lib/components/header/UserDropdownMenu';

interface Props {
  profiles: Profile[];
  currentProfile?: Profile;
  disableDropdown?: boolean;
  onOpenDropdown?: () => void;
}

export default function ProfileDropdownWrapper({
  profiles,
  currentProfile,
  disableDropdown,
  onOpenDropdown,
}: Props) {
  return (
    <ProfileProvider>
      <UserDropdownMenu
        profiles={profiles}
        currentProfile={currentProfile}
        disableDropdown={disableDropdown}
        onOpenDropdown={onOpenDropdown}
      />
    </ProfileProvider>
  );
}
