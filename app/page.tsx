"use client";

import { FormEvent, useState } from "react";

interface CreateUrlResponse {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  expiresAt: string | null;
  isActive: boolean;
}

interface UrlStats {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  lastAccessedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [result, setResult] = useState<CreateUrlResponse | null>(null);
  const [stats, setStats] = useState<UrlStats | null>(null);

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [error, setError] = useState("");

  const createShortUrl = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setResult(null);
    setStats(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          originalUrl,
          customCode: customCode || undefined,
          expiresAt: expiresAt
            ? new Date(expiresAt).toISOString()
            : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create URL");
      }

      setResult(data);
      setOriginalUrl("");
      setCustomCode("");
      setExpiresAt("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyShortUrl = async () => {
    if (!result) return;

    await navigator.clipboard.writeText(result.shortUrl);
  };

  const getStats = async () => {
    if (!result) return;

    setStatsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/urls/${result.id}/stats`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get statistics");
      }

      setStats(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to get statistics"
      );
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="mx-auto max-w-2xl">

        {/* Header */}

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            URL Shortener
          </h1>

          <p className="mt-2 text-gray-600">
            Create short and shareable URLs
          </p>
        </div>

        {/* Create URL Card */}

        <div className="rounded-xl bg-white p-6 shadow">
          <form onSubmit={createShortUrl}>

            {/* Original URL */}

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Original URL
            </label>

            <input
              type="url"
              required
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="mb-5 w-full text-gray-900 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* Custom Code */}

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Custom code
              <span className="ml-2 text-gray-400">
                (optional)
              </span>
            </label>

            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="my-link"
              className="mb-5 w-full text-gray-900 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* Expiry */}

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Expiry
              <span className="ml-2 text-gray-400">
                (optional)
              </span>
            </label>

            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mb-6 w-full text-gray-900 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Creating..." : "Create Short URL"}
            </button>

          </form>

          {/* Error */}

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

        </div>

        {/* Result */}

        {result && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow">

            <h2 className="mb-4 text-gray-500 text-lg font-semibold">
              Your Short URL
            </h2>

            <div className="flex gap-2">

              <input
                readOnly
                value={result.shortUrl}
                className="flex-1 text-gray-900 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3"
              />

              <button
                onClick={copyShortUrl}
                className="rounded-lg bg-gray-800 px-5 py-3 font-medium text-white hover:bg-gray-900"
              >
                Copy
              </button>

            </div>

            <div className="mt-4 flex gap-3">

              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open URL
              </a>

              <button
                onClick={getStats}
                disabled={statsLoading}
                className="text-sm text-blue-600 hover:underline"
              >
                {statsLoading
                  ? "Loading..."
                  : "View Statistics"}
              </button>

            </div>

          </div>
        )}

        {/* Statistics */}

        {stats && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow">

            <h2 className="mb-5 text-lg font-semibold">
              Usage Statistics
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Clicks
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {stats.clicks}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <p className="mt-1 font-semibold">
                  {stats.isActive
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Created
                </p>

                <p className="mt-1 text-sm">
                  {new Date(
                    stats.createdAt
                  ).toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Last accessed
                </p>

                <p className="mt-1 text-sm">
                  {stats.lastAccessedAt
                    ? new Date(
                        stats.lastAccessedAt
                      ).toLocaleString()
                    : "Never"}
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}