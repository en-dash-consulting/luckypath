import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Lucky Path</title>
        <Meta />
        <Links />
        {import.meta.env.PROD && (
          <>
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-RMKR4MM0MH"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-RMKR4MM0MH');
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
      <a
        href="https://endash.us"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity z-40"
      >
        <svg width="18" height="18" viewBox="0 0 330 330" fill="none">
          <rect x="7.5" y="7.5" width="315" height="315" stroke="currentColor" strokeWidth="15"/>
          <path d="M315 15H15V315H315V15Z" fill="#001769"/>
          <path d="M315 232.119H47.0074V247.705H315V232.119Z" fill="#00E5B9"/>
          <path d="M139.795 164.997L145.324 169.838C140.942 178.372 126.191 192.894 100.589 192.894C71.774 192.894 45.0248 174.678 45.0248 139.625C45.0248 103.424 73.6102 85.438 102.425 85.438C127.088 85.438 146.471 98.8126 146.471 119.323C146.471 137.538 131.261 140.084 106.807 141.002L81.4555 141.92C77.3033 142.15 76.3853 145.613 77.7624 150.913C83.5212 167.522 96.8958 176.974 113.964 176.974C122.727 176.995 131.72 174.679 139.795 164.997ZM74.5491 124.185C74.3196 131.112 76.6148 133.866 82.624 133.866H94.851C114.673 133.866 120.682 127.648 120.682 117.028C120.682 105.26 112.837 94.2014 99.0031 94.2014C83.3125 94.2222 75.6967 106.658 74.5491 124.185Z" fill="white"/>
          <path d="M244.225 173.531V131.571C244.225 114.503 237.068 102.986 223.005 102.986C208.253 102.986 199.261 114.524 199.261 131.571V169.608C199.261 179.519 203.183 182.754 213.783 183.672V191.517H156.842V183.672C167.671 182.754 171.593 179.519 171.593 169.608V112.187C171.593 101.588 167.212 98.8128 156.842 99.7308V91.8855L189.12 85.8972C195.797 84.7496 199.261 87.7333 199.261 93.054C199.261 101.358 202.954 103.424 205.937 99.9812C211.008 94.4519 220.23 85 238.445 85C255.284 85 271.871 93.3044 271.871 125.583V171.006C271.871 178.622 275.794 181.376 283.639 179.77V187.615C279.487 190.849 270.953 192.685 264.277 192.685C251.611 192.664 244.225 185.988 244.225 173.531Z" fill="white"/>
        </svg>
        <span className="text-xs text-gray-500 font-medium">Built by En Dash</span>
      </a>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto font-display">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
