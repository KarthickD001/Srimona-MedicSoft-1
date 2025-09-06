
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pill } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Default credentials are admin/password for demo purposes
      if (username === 'admin' && password === 'password') {
        toast({
          title: 'First Login Detected',
          description: 'Please change your password to continue.',
        });
        setShowPasswordChange(true);
      } else if (username === 'admin' && password !== 'password' && password.length > 0) {
        // Any password other than 'password' is considered valid for the demo for admin
         toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid Credentials',
          description: 'Please check your username and password. Hint: try admin/password',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Weak Password',
            description: 'Password must be at least 6 characters.',
        });
        return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please re-enter your new password.',
      });
      return;
    }
    
    setIsLoading(true);
    // Simulate API call to change password
    setTimeout(() => {
      toast({
        title: 'Password Changed Successfully',
        description: 'Redirecting you to the dashboard.',
      });
      router.push('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  const renderLoginForm = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard. For demo, use username 'admin' and password 'password'.</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="e.g. admin" required value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
             <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="#"
                className="ml-auto inline-block text-sm underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
           <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );

  const renderPasswordChangeForm = () => (
     <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Change Password</CardTitle>
        <CardDescription>For security, you must change your password on first login.</CardDescription>
      </CardHeader>
      <form onSubmit={handleChangePassword}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Set New Password and Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex items-center gap-3 text-center">
        <div className="rounded-full bg-primary p-3">
          <Pill className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Srimona MedSoft</h1>
          <p className="text-lg text-muted-foreground">Your Modern Pharmacy Solution</p>
        </div>
      </div>

      <div className="w-full max-w-md">
        {!showPasswordChange ? renderLoginForm() : renderPasswordChangeForm()}
      </div>
    </div>
  );
}
