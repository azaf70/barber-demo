import React, { useState, useEffect } from 'react';
import { User, Sun, Bell, Lock, Trash2 } from 'lucide-react';
import PageHeader from '@shared/components/PageHeader';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Checkbox } from '@shared/components/ui/checkbox';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@shared/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader as DialogHeaderUI, DialogTitle, DialogDescription, DialogFooter as DialogFooterUI, DialogClose } from '@shared/components/ui/dialog';

const SettingsPage = ({ user }) => {
  // Controlled state for all fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [theme, setTheme] = useState('system');
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Populate fields from user prop
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setTheme(user.preferences?.theme || 'system');
      setEmailNotif(user.preferences?.notifications?.email ?? true);
      setSmsNotif(user.preferences?.notifications?.sms ?? false);
      setPushNotif(user.preferences?.notifications?.push ?? false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <PageHeader title="Settings" subtitle="Manage your account settings and preferences" />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="space-y-8">
          {/* Account Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle>Account</CardTitle>
              </div>
              <CardDescription>Basic information about your account.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} onChange={e => setEmail(e.target.value)} disabled />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Sun className="w-5 h-5 text-primary" />
                <CardTitle>Preferences</CardTitle>
              </div>
              <CardDescription>Customize your experience.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme" className="mt-1">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System Default</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notifications</Label>
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={emailNotif} onCheckedChange={setEmailNotif} id="notif-email" />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={smsNotif} onCheckedChange={setSmsNotif} id="notif-sms" />
                      <span>SMS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={pushNotif} onCheckedChange={setPushNotif} id="notif-push" />
                      <span>Push</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value="********" disabled />
              </div>
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogTrigger asChild>
                  <Button className="mt-4 md:mt-0" type="button" variant="secondary">Change Password</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeaderUI>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>Enter your current and new password below.</DialogDescription>
                  </DialogHeaderUI>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" autoComplete="current-password" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" autoComplete="new-password" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" autoComplete="new-password" />
                    </div>
                    <DialogFooterUI>
                      <Button type="submit">Save</Button>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                    </DialogFooterUI>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-700">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </div>
              <CardDescription>Delete your account and all associated data. This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 