import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity } from "lucide-react";

const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin@12";
const REMEMBER_KEY = "serialsensei:remember";
const USERNAME_KEY = "serialsensei:username";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBER_KEY) === "true";
    if (remembered) {
      const storedUser = window.localStorage.getItem(USERNAME_KEY) ?? VALID_USERNAME;
      setUsername(storedUser);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const isValidUser = username.trim() === VALID_USERNAME;
    const isValidPassword = password === VALID_PASSWORD;

    if (isValidUser && isValidPassword) {
      if (rememberMe) {
        window.localStorage.setItem(REMEMBER_KEY, "true");
        window.localStorage.setItem(USERNAME_KEY, username.trim());
      } else {
        window.localStorage.removeItem(REMEMBER_KEY);
        window.localStorage.removeItem(USERNAME_KEY);
      }

      setError(null);
      setLocation("/dashboard");
      return;
    }

    setError("Invalid credentials. Use admin / admin@12 to continue.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/10 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Serial Monitor Dashboard</CardTitle>
            <CardDescription className="mt-2">
              Sign in with your administrator account to access the dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                data-testid="checkbox-remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Remember me on this device
              </Label>
            </div>

            {error && (
              <Alert variant="destructive" data-testid="alert-login-error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
