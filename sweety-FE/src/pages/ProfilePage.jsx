import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Shield,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorPayload } from '../api/client.js';
import { ConfirmModal } from '../components/ui/ConfirmModal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { Input } from '../components/ui/Input.jsx';
import { changeUserPassword, updateUserProfile } from '../features/auth/auth.api.js';
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateProfileSchema,
  validateAuth,
} from '../features/auth/auth.validation.js';
import { useAuth } from '../features/auth/AuthContext.jsx';

export function ProfilePage() {
  const { user, logout, updateUser, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileGeneralError, setProfileGeneralError] = useState('');
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordGeneralError, setPasswordGeneralError] = useState('');
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Format creation date
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

  // Handle Profile Update
  async function handleUpdateProfile(e) {
    e.preventDefault();
    setProfileErrors({});
    setProfileGeneralError('');
    setProfileSuccessMessage('');

    // Zod validation on FE
    const validation = validateAuth(updateProfileSchema, {
      name,
      currentPassword: profilePassword,
    });

    if (!validation.success) {
      if (validation.error.field) {
        setProfileErrors({ [validation.error.field]: validation.error.message });
      } else {
        setProfileGeneralError(validation.error.message);
      }
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const res = await updateUserProfile({
        name: validation.data.name,
        currentPassword: validation.data.currentPassword,
      });

      if (res?.user) {
        updateUser(res.user);
      }
      setProfilePassword('');
      setProfileSuccessMessage('Profile name updated successfully.');
    } catch (err) {
      const payload = getErrorPayload(err);
      if (payload.field) {
        setProfileErrors({ [payload.field]: payload.message });
      } else {
        setProfileGeneralError(payload.message);
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  // Handle Change Password
  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordGeneralError('');
    setPasswordSuccessMessage('');

    // Zod validation on FE
    const validation = validateAuth(changePasswordSchema, {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      if (validation.error.field) {
        setPasswordErrors({ [validation.error.field]: validation.error.message });
      } else {
        setPasswordGeneralError(validation.error.message);
      }
      return;
    }

    try {
      setIsChangingPassword(true);
      await changeUserPassword({
        currentPassword: validation.data.currentPassword,
        newPassword: validation.data.newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccessMessage('Password updated successfully.');
    } catch (err) {
      const payload = getErrorPayload(err);
      if (payload.field) {
        setPasswordErrors({ [payload.field]: payload.message });
      } else {
        setPasswordGeneralError(payload.message);
      }
    } finally {
      setIsChangingPassword(false);
    }
  }

  // Handle Logout Confirmation
  function handleConfirmLogout() {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  }

  // Handle Delete Account
  async function handleDeleteAccount(e) {
    e.preventDefault();
    setDeleteError('');

    // Zod validation on FE
    const validation = validateAuth(deleteAccountSchema, {
      password: deletePassword,
    });

    if (!validation.success) {
      setDeleteError(validation.error.message);
      return;
    }

    try {
      setIsDeletingAccount(true);
      await deleteAccount({ password: validation.data.password });
      setShowDeleteModal(false);
      navigate('/login');
    } catch (err) {
      const payload = getErrorPayload(err);
      setDeleteError(payload.message);
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Hero Card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-800 via-rose-900 to-stone-900 p-6 text-white shadow-md sm:p-8"
      >
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl font-bold font-display ring-2 ring-white/20 backdrop-blur-sm sm:h-20 sm:w-20 sm:text-3xl">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">{user?.name}</h1>
                <span className="rounded-full bg-rose-500/30 px-2.5 py-0.5 text-xs font-semibold text-rose-200 ring-1 ring-rose-400/30">
                  Verified
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-rose-200">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-rose-300/80">
                <Calendar className="h-3.5 w-3.5" />
                Member since {memberSince}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-medium text-rose-100 ring-1 ring-white/15 backdrop-blur-sm sm:self-auto">
            <Shield className="h-4 w-4 text-rose-300" />
            <span>Account Protected</span>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card 1: Edit Profile (Name & Locked Email) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-stone-200/80 sm:p-7"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-100 text-rose-700">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">Personal Details</h2>
              <p className="text-xs text-stone-500">View your details or update your display name</p>
            </div>
          </div>

          {profileSuccessMessage ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{profileSuccessMessage}</span>
            </div>
          ) : null}

          {profileGeneralError ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{profileGeneralError}</span>
            </div>
          ) : null}

          <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
            {/* Locked Email Field */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-stone-600" htmlFor="profile-email">
                  Email Address
                </label>
                <span className="inline-flex items-center gap-1 text-xs text-stone-400 font-medium">
                  <Lock className="h-3 w-3" />
                  Cannot be changed
                </span>
              </div>
              <div className="relative mt-1">
                <input
                  id="profile-email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  className="w-full cursor-not-allowed rounded-2xl border border-stone-200 bg-stone-100/90 px-3.5 py-2.5 text-stone-500 shadow-xs outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-stone-400">
                Your email address is permanent and used for secure account login.
              </p>
            </div>

            {/* Editable Name Field */}
            <div>
              <Input
                label="Full Name"
                id="profile-name"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setProfileErrors((prev) => ({ ...prev, name: null }));
                }}
                error={Boolean(profileErrors.name)}
                placeholder="Enter your name"
                required
              />
              <ErrorMessage>{profileErrors.name}</ErrorMessage>
            </div>

            {/* Current Password for verification */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-stone-600" htmlFor="profile-password">
                  Current Password
                </label>
                <span className="text-xs text-stone-400">Required to save changes</span>
              </div>
              <div className="relative mt-1">
                <input
                  id="profile-password"
                  name="currentPassword"
                  type={showProfilePassword ? 'text' : 'password'}
                  value={profilePassword}
                  onChange={(e) => {
                    setProfilePassword(e.target.value);
                    setProfileErrors((prev) => ({ ...prev, currentPassword: null }));
                  }}
                  placeholder="Enter current password"
                  className={`w-full rounded-2xl border bg-white/80 px-3.5 py-2.5 pr-10 text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-4 ${
                    profileErrors.currentPassword
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                      : 'border-stone-200 focus:border-rose-300 focus:ring-rose-100'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowProfilePassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                >
                  {showProfilePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <ErrorMessage>{profileErrors.currentPassword}</ErrorMessage>
            </div>

            <div className="pt-2">
              <Button type="submit" loading={isUpdatingProfile} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          </form>
        </motion.section>

        {/* Card 2: Change Password */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-stone-200/80 sm:p-7"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-100 text-amber-800">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">Change Password</h2>
              <p className="text-xs text-stone-500">Ensure your account is using a secure password</p>
            </div>
          </div>

          {passwordSuccessMessage ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{passwordSuccessMessage}</span>
            </div>
          ) : null}

          {passwordGeneralError ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{passwordGeneralError}</span>
            </div>
          ) : null}

          <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-stone-600" htmlFor="change-current-password">
                Current Password
              </label>
              <div className="relative mt-1">
                <input
                  id="change-current-password"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordErrors((prev) => ({ ...prev, currentPassword: null }));
                  }}
                  placeholder="Enter your current password"
                  className={`w-full rounded-2xl border bg-white/80 px-3.5 py-2.5 pr-10 text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-4 ${
                    passwordErrors.currentPassword
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                      : 'border-stone-200 focus:border-rose-300 focus:ring-rose-100'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <ErrorMessage>{passwordErrors.currentPassword}</ErrorMessage>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-stone-600" htmlFor="change-new-password">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="change-new-password"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordErrors((prev) => ({ ...prev, newPassword: null }));
                  }}
                  placeholder="At least 8 characters"
                  className={`w-full rounded-2xl border bg-white/80 px-3.5 py-2.5 pr-10 text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-4 ${
                    passwordErrors.newPassword
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                      : 'border-stone-200 focus:border-rose-300 focus:ring-rose-100'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <ErrorMessage>{passwordErrors.newPassword}</ErrorMessage>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-stone-600" htmlFor="change-confirm-password">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="change-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Re-enter new password"
                  className={`w-full rounded-2xl border bg-white/80 px-3.5 py-2.5 pr-10 text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-4 ${
                    passwordErrors.confirmPassword
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                      : 'border-stone-200 focus:border-rose-300 focus:ring-rose-100'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <ErrorMessage>{passwordErrors.confirmPassword}</ErrorMessage>
            </div>

            <div className="pt-2">
              <Button type="submit" loading={isChangingPassword} className="w-full sm:w-auto">
                Update Password
              </Button>
            </div>
          </form>
        </motion.section>
      </div>

      {/* Card 3: Session & Logout */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-stone-200/80 sm:p-7"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-stone-100 text-stone-700">
              <LogOut className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">Session & Sign Out</h2>
              <p className="text-xs text-stone-500">Sign out of your active session on this device</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowLogoutModal(true)}
            className="self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </motion.section>

      {/* Card 4: Danger Zone - Delete Account */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 shadow-xs sm:p-7"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-rose-950">Danger Zone</h2>
              <p className="mt-1 text-sm text-rose-800">
                Permanently delete your Sweety profile and all recorded blood glucose readings. This action cannot be undone.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              setDeletePassword('');
              setDeleteError('');
              setShowDeleteModal(true);
            }}
            className="self-start shrink-0 sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </motion.section>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Log Out?"
        description="Are you sure you want to log out of your Sweety account?"
        confirmText="Log Out"
        confirmVariant="primary"
        icon={LogOut}
        onConfirm={handleConfirmLogout}
        onClose={() => setShowLogoutModal(false)}
      />

      {/* Delete Account Modal (Requires Password) */}
      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
            onClick={() => (!isDeletingAccount ? setShowDeleteModal(false) : null)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-[#fbf7f2] p-6 shadow-2xl ring-1 ring-stone-200/80"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-stone-900">
                    Delete Your Account?
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeletingAccount}
                    className="rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                  This action is permanent and will delete all your blood glucose records. Please enter your password to confirm.
                </p>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700" htmlFor="delete-password">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="delete-password"
                    name="password"
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError('');
                    }}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-stone-200 bg-white/90 px-3.5 py-2.5 pr-10 text-stone-900 shadow-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    tabIndex={-1}
                  >
                    {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <ErrorMessage>{deleteError}</ErrorMessage>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeletingAccount}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  loading={isDeletingAccount}
                  className="bg-rose-700 text-white hover:bg-rose-800"
                >
                  Confirm Delete
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}

