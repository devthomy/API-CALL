"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { User } from "./interface/user";
import { cn } from "@/lib/utils";
import DotPattern from "@/components/ui/dot-pattern";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardItem {
  id: number;
  username: string;
  score: number;
  position?: number;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/leaderboard/get", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }

      const data = await response.json();

      const transformedData = data.map((item: LeaderboardItem) => ({
        id: item.id,
        Name: item.username,
        Score: item.score,
      }));

      setUsers(transformedData);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch leaderboard data",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  const handleUpdateScore = async (id: number, newScore: number) => {
    try {
      const currentUser = users.find((user) => user.id === id);
      if (!currentUser) return;

      const response = await fetch(`/api/leaderboard/put`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: id,
          username: currentUser.Name,
          score: newScore,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update score");
      }

      toast({
        title: "Success",
        description: "Score updated successfully",
      });

      handleLeaderboard();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive",
      });
    }
  };

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
        toast({
          title: "Error",
          description: data.error || "Login failed",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen relative bg-gradient-to-br from-background to-muted">
        <DotPattern
          className={cn(
            "absolute inset-0 opacity-50 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
          )}
        />
        <div className="w-full max-w-md p-8 bg-card/95 backdrop-blur-sm rounded-xl shadow-2xl relative z-10 border border-muted">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Login</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg border border-input bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 text-foreground/80"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-input bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all duration-200 py-6 text-lg font-medium"
            >
              Login
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <span>Need quick access? </span>
            <Button
              variant="link"
              onClick={() => {
                setEmail("alice.martin@example.com");
                setPassword("password789");
              }}
              className="p-0 h-auto font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Use demo account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen bg-gradient-to-br from-background to-muted">
      <DotPattern
        className={cn(
          "absolute inset-0 opacity-50 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
        )}
      />
      <div className="flex justify-between items-center mb-8 relative z-10 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Leaderboard</h1>
        <Button
          onClick={() => {
            setToken(null);
            toast({
              description: "Successfully logged out",
            });
          }}
          variant="outline"
          className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
        >
          Logout
        </Button>
      </div>
      <div className="bg-card/95 max-w-5xl mx-auto backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden relative z-10 border border-muted">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/30 text-foreground transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.Name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.Score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateScore(user.id, user.Score - 1)}
                      className="hover:bg-destructive/10 transition-colors duration-200"
                    >
                      -1
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newScore = prompt("Enter new score:");
                        if (newScore !== null) {
                          const score = parseInt(newScore);
                          if (!isNaN(score)) {
                            handleUpdateScore(user.id, score);
                          }
                        }
                      }}
                      className="hover:bg-primary/10 transition-colors duration-200"
                    >
                      Set
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateScore(user.id, user.Score + 1)}
                      className="hover:bg-primary/10 transition-colors duration-200"
                    >
                      +1
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-muted-foreground text-lg"
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
