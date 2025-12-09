import Link from "next/link";
import { DeployButton } from "./deploy-button";
import { hasEnvVars } from "@/lib/utils";
import { EnvVarWarning } from "./env-var-warning";
import { Suspense } from "react";
import { AuthButton } from "./auth-button";

export function Header() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"}>okhabit</Link>
        </div>
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <Suspense>
            <AuthButton />
          </Suspense>
        )}
      </div>
    </nav>
  );
}
