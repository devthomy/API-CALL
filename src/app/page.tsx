"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { User } from "./interface/user";
import { cn } from "@/lib/utils";
import DotPattern from "@/components/ui/dot-pattern";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardItem {
  username?: string;
  name?: string;
  Name?: string;
  score?: number;
  Score?: number;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLeaderboard = useCallback(async () => {
    try {
      console.log("Fetching leaderboard data...");
      const response = await fetch("/api/leaderboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }

      const data = await response.json();
      console.log("Leaderboard data received:", data);

      const transformedData = data.map((item: LeaderboardItem) => ({
        Name: item.username || item.name || item.Name,
        Score: item.score || item.Score || 0,
      }));

      console.log("Transformed data:", transformedData);
      setUsers(transformedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leaderboard data",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) {
      handleLeaderboard();
    }
  }, [token, handleLeaderboard]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          Password: password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        toast({
          title: "Success",
          description: "Successfully logged in",
        });
      } else {
        console.error("Login failed:", data.error);
        toast({
          title: "Error",
          description: data.error || "Login failed",
          variant: "destructive",
        });
      }
    } catch  {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen relative">
        <DotPattern
          className={cn(
            "absolute inset-0 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
          )}
        />
        <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg relative z-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full hover:opacity-90 transition-opacity"
            >
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <span>Need quick access? </span>
            <Button
              variant="link"
              onClick={() => {
                setEmail("alice.martin@example.com");
                setPassword("password789");
              }}
              className="p-0 h-auto font-medium text-primary hover:underline"
            >
              Use demo account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <DotPattern
        className={cn(
          "absolute inset-0 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
        )}
      />
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <Button
          onClick={() => {
            setToken(null);
            toast({
              description: "Successfully logged out",
            });
          }}
          variant="outline"
          className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Logout
        </Button>
      </div>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden relative z-10">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={index}
                  className="hover:bg-muted/50 text-foreground transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.Name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.Score}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No leaderboard data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
