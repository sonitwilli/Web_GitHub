# Custom Hooks

## useProfileSwitcher

Custom hook để theo dõi `selectedProfile` và tự động gọi API `switchProfile` khi cần thiết.

### Cách sử dụng

```tsx
import { useProfileSwitcher } from '@/lib/hooks/useProfileSwitcher';

const MyComponent = () => {
  const { selectedProfile } = useProfileContext();

  const { isSwitching, switchProfile, lastSwitchedProfile } =
    useProfileSwitcher({
      selectedProfile,
      onProfileSwitch: (profileId) => {
        console.log('Profile switched successfully:', profileId);
        // Logic xử lý khi switch profile thành công
      },
      onProfileSwitchError: (error) => {
        console.error('Profile switch failed:', error);
        // Logic xử lý khi switch profile thất bại
      },
    });

  return (
    <div>
      <button
        onClick={() =>
          selectedProfile?.profile_id &&
          switchProfile(selectedProfile.profile_id)
        }
        disabled={isSwitching}
      >
        {isSwitching ? 'Đang chuyển đổi...' : 'Chuyển đổi hồ sơ'}
      </button>

      {lastSwitchedProfile && (
        <p>Profile cuối cùng đã chuyển đổi: {lastSwitchedProfile}</p>
      )}
    </div>
  );
};
```

### Props

| Prop                   | Type                          | Required | Description                            |
| ---------------------- | ----------------------------- | -------- | -------------------------------------- |
| `selectedProfile`      | `Profile \| null`             | ✅       | Profile hiện tại được chọn             |
| `onProfileSwitch`      | `(profileId: string) => void` | ❌       | Callback khi switch profile thành công |
| `onProfileSwitchError` | `(error: string) => void`     | ❌       | Callback khi switch profile thất bại   |

### Returns

| Property              | Type                                   | Description                                       |
| --------------------- | -------------------------------------- | ------------------------------------------------- |
| `isSwitching`         | `boolean`                              | Trạng thái đang chuyển đổi profile                |
| `switchProfile`       | `(profileId: string) => Promise<void>` | Hàm để chuyển đổi profile                         |
| `lastSwitchedProfile` | `string \| null`                       | ID của profile cuối cùng đã chuyển đổi thành công |

### Tính năng

1. **Tự động theo dõi**: Hook sẽ tự động theo dõi thay đổi của `selectedProfile` và gọi API `switchProfile` khi cần thiết.

2. **Kiểm tra localStorage**: Hook sẽ so sánh profile hiện tại với profile đã lưu trong localStorage để tránh gọi API không cần thiết.

3. **Xử lý lỗi**: Tự động hiển thị toast message khi có lỗi xảy ra.

4. **Cập nhật localStorage**: Tự động cập nhật `profile_id` và `userSelected` trong localStorage khi switch profile thành công.

5. **Refresh page**: Tự động refresh page để cập nhật dữ liệu sau khi switch profile thành công.

### Lưu ý

- Hook này sử dụng `useRouter` từ Next.js để refresh page.
- Hook này sử dụng `showToast` để hiển thị thông báo.
- Hook này chỉ gọi API khi profile thực sự thay đổi và khác với profile cuối cùng đã switch.

